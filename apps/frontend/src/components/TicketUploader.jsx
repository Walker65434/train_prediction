import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faTicket,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faTrash,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { extractTrainNumberFromImage } from '../lib/ocr';

export const TicketUploader = ({ onSelectTrainNumber }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [extractedNumber, setExtractedNumber] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setExtractedNumber(null);
    setCandidates([]);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Run OCR
    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Preparing OCR scanner...');

    try {
      const result = await extractTrainNumberFromImage(
        selectedFile,
        (pct, status) => {
          setProgress(pct);
          setStatusMessage(status);
        }
      );

      if (result.trainNumber) {
        setExtractedNumber(result.trainNumber);
        setCandidates(result.allCandidates || []);
        toast.success(`Found Train #${result.trainNumber}!`, { icon: '🎫' });
        if (onSelectTrainNumber) {
          onSelectTrainNumber(result.trainNumber);
        }
      } else if (result.allCandidates && result.allCandidates.length > 0) {
        setExtractedNumber(result.allCandidates[0]);
        setCandidates(result.allCandidates);
        toast('Possible train number found. Please verify.', { icon: '🔍' });
        if (onSelectTrainNumber) {
          onSelectTrainNumber(result.allCandidates[0]);
        }
      } else {
        setErrorMsg(
          'Could not detect a 5-digit train number. You can enter it manually below.'
        );
        toast.error('Could not extract train number from ticket');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing ticket image');
      toast.error('OCR processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setExtractedNumber(null);
    setCandidates([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!file ? (
        // Dropzone
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-base-700/80 bg-base-900/40 hover:border-primary/60 hover:bg-base-900/60'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-base-800/90 border border-base-700/60 flex items-center justify-center text-primary shadow-inner">
            <FontAwesomeIcon icon={faUpload} className="text-xl" />
          </div>
          <h4 className="text-base font-semibold text-white mb-1">
            Upload Ticket Image for AI Extraction
          </h4>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto mb-3">
            Drop your IRCTC ticket screenshot or photo here. Our OCR
            automatically detects the 5-digit train number.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <FontAwesomeIcon icon={faTicket} /> Browse Image File
          </span>
        </div>
      ) : (
        // Preview and Progress Card
        <div className="rounded-2xl border border-base-700/80 bg-base-900/70 p-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Thumbnail Preview */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-base-700 flex-shrink-0 bg-base-800">
              <img
                src={previewUrl}
                alt="Ticket Preview"
                className="w-full h-full object-cover"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="text-primary text-xl animate-spin"
                  />
                </div>
              )}
            </div>

            {/* OCR Info & Status */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-base-content/60 truncate max-w-[200px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              </div>

              {/* Progress Bar during OCR */}
              {isProcessing && (
                <div className="space-y-1.5 my-2">
                  <div className="flex justify-between text-xs text-base-content/80">
                    <span>{statusMessage}</span>
                    <span className="font-mono font-bold text-primary">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-base-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Number Result */}
              <AnimatePresence>
                {!isProcessing && extractedNumber && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-xs">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Detected Train:</span>
                        <span className="font-mono font-bold text-sm text-emerald-300">
                          {extractedNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectTrainNumber(extractedNumber)}
                        className="btn btn-xs btn-primary rounded-lg shadow-sm"
                      >
                        <FontAwesomeIcon icon={faMagnifyingGlass} /> Apply to
                        Search
                      </button>
                    </div>

                    {/* Multiple Candidates if available */}
                    {candidates.length > 1 && (
                      <div className="mt-2 text-xs text-base-content/60 flex items-center gap-1.5 flex-wrap">
                        <span>Other detected numbers:</span>
                        {candidates
                          .filter((c) => c !== extractedNumber)
                          .map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setExtractedNumber(num);
                                onSelectTrainNumber(num);
                              }}
                              className="px-2 py-0.5 rounded bg-base-800 hover:bg-base-700 text-base-content/80 font-mono text-[11px] transition-colors"
                            >
                              {num}
                            </button>
                          ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {!isProcessing && errorMsg && (
                <div className="mt-2 text-xs text-amber-400/90 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketUploader;

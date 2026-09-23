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
  faWandMagicSparkles,
  faCamera,
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
      toast.error('Please upload a valid image file (PNG, JPG, JPEG)', {
        icon: '📷',
      });
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
    setStatusMessage('Initializing AI OCR scanner...');

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
        toast('Possible train number detected. Please verify.', { icon: '🔍' });
        if (onSelectTrainNumber) {
          onSelectTrainNumber(result.allCandidates[0]);
        }
      } else {
        setErrorMsg(
          'Could not detect a 5-digit train number. You can enter it manually.'
        );
        toast.error('Could not extract train number from ticket screenshot');
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
          className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01] shadow-xl shadow-cyan-500/10'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-slate-700/60 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faUpload} className="text-2xl" />
          </div>
          <h4 className="text-base font-bold text-white mb-1 font-heading">
            Upload IRCTC Ticket Screenshot
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Drag & drop your e-ticket or photo here. Client-side Tesseract.js
            reads the 5-digit train number automatically.
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-400 transition-all shadow-sm">
            <FontAwesomeIcon icon={faCamera} />
            <span>Select Image File</span>
          </span>
        </div>
      ) : (
        // Preview and Scanner Card
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Thumbnail Preview with Laser Sweep Line */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-950 shadow-inner">
              <img
                src={previewUrl}
                alt="Ticket Preview"
                className="w-full h-full object-cover opacity-90"
              />
              {isProcessing && (
                <>
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
                  {/* Glowing Laser Scan Bar */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-laser" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-cyan-400 text-2xl animate-spin drop-shadow"
                    />
                  </div>
                </>
              )}
            </div>

            {/* OCR Info & Status */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <FontAwesomeIcon
                    icon={faTicket}
                    className="text-indigo-400 text-xs"
                  />
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors flex items-center gap-1"
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Progress Bar during OCR */}
              {isProcessing && (
                <div className="space-y-2 my-2.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FontAwesomeIcon
                        icon={faWandMagicSparkles}
                        className="text-cyan-400 text-xs"
                      />
                      {statusMessage}
                    </span>
                    <span className="font-mono font-bold text-cyan-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 h-full rounded-full"
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-xs shadow-sm">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Detected Train:</span>
                        <span className="font-mono font-bold text-sm text-emerald-300 tracking-wider">
                          #{extractedNumber}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectTrainNumber(extractedNumber)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <span>Apply #{extractedNumber}</span>
                      </button>
                    </div>

                    {/* Multiple Candidates if available */}
                    {candidates.length > 1 && (
                      <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] font-medium text-slate-500">
                          Other candidate numbers:
                        </span>
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
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors border border-slate-700"
                            >
                              #{num}
                            </button>
                          ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              {!isProcessing && errorMsg && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
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

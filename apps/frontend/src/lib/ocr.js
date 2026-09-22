import Tesseract from 'tesseract.js';

/**
 * Extract 5-digit train number from raw OCR text
 * @param {string} text
 * @returns {{ trainNumber: string | null, allCandidates: string[] }}
 */
export const parseTrainNumberFromText = (text) => {
  if (!text) return { trainNumber: null, allCandidates: [] };

  // 1. High-priority contextual regex (e.g. "Train No: 12951", "Train # 19217", "Trn No. 12002")
  const contextRegex =
    /(?:train\s*(?:no|number|num|\#)?[:\.\s\-\/]*\s*)(\d{5})\b/i;
  const contextMatch = text.match(contextRegex);

  // 2. Extract all distinct 5-digit sequences
  // Avoid matching parts of 6-digit pincodes or 10-digit PNR numbers
  const allFiveDigits = [];
  const fiveDigitRegex = /(?<!\d)(\d{5})(?!\d)/g;
  let match;
  while ((match = fiveDigitRegex.exec(text)) !== null) {
    if (!allFiveDigits.includes(match[1])) {
      allFiveDigits.push(match[1]);
    }
  }

  // Filter out any obvious false positives (e.g. "00000", "99999")
  const validCandidates = allFiveDigits.filter(
    (num) => num !== '00000' && num !== '99999' && !num.startsWith('000')
  );

  let detectedTrain = null;
  if (contextMatch && contextMatch[1]) {
    detectedTrain = contextMatch[1];
  } else if (validCandidates.length > 0) {
    detectedTrain = validCandidates[0];
  }

  return {
    trainNumber: detectedTrain,
    allCandidates: validCandidates,
  };
};

/**
 * Perform client-side OCR on an image file/blob
 * @param {File | Blob | string} imageSource
 * @param {(progress: number, status: string) => void} onProgress
 * @returns {Promise<{ rawText: string, trainNumber: string | null, allCandidates: string[] }>}
 */
export const extractTrainNumberFromImage = async (
  imageSource,
  onProgress = () => {}
) => {
  try {
    const result = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          onProgress(pct, 'Extracting text...');
        } else if (
          m.status === 'loading tesseract core' ||
          m.status === 'initializing tesseract'
        ) {
          onProgress(15, 'Initializing OCR engine...');
        } else if (m.status === 'loading language traineddata') {
          onProgress(35, 'Loading language model...');
        } else {
          onProgress(5, 'Processing image...');
        }
      },
    });

    const rawText = result?.data?.text || '';
    const { trainNumber, allCandidates } = parseTrainNumberFromText(rawText);

    return {
      rawText,
      trainNumber,
      allCandidates,
    };
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    throw new Error('Failed to read image. Please ensure the image is clear.');
  }
};

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Start a watch session for a given train ID/number
 * @param {string} trainId
 * @returns {Promise<{ watchId: string, trainId: string, status: string, message: string }>}
 */
export const startWatchSession = async (trainId) => {
  const response = await apiClient.post('/watch', {
    trainId: String(trainId).trim(),
  });
  return response.data;
};

/**
 * Fetch the latest cached train prediction/result from database
 * @param {string} trainId
 * @returns {Promise<{ result: object }>}
 */
export const fetchTrainResult = async (trainId) => {
  const response = await apiClient.get(`/result/${String(trainId).trim()}`);
  return response.data;
};

export default apiClient;

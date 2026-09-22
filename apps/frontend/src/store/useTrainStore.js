import { create } from 'zustand';

const getInitialRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recent_train_searches');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const useTrainStore = create((set, get) => ({
  currentTrainId: '',
  watchId: null,
  watchStatus: 'IDLE', // 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'STOPPED' | 'ERROR'
  trainData: null,
  isLoading: false,
  isLiveConnected: false,
  lastHeartbeatAck: null,
  lastUpdated: null,
  errorMessage: null,
  recentSearches: getInitialRecentSearches(),

  setTrainId: (trainId) => set({ currentTrainId: String(trainId).trim() }),

  setWatchSession: (watchId, trainId) =>
    set({
      watchId,
      currentTrainId: String(trainId).trim(),
      watchStatus: 'ACTIVE',
      errorMessage: null,
    }),

  setTrainData: (data) =>
    set({
      trainData: data,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      errorMessage: null,
    }),

  updateEtaData: (update) => {
    const existing = get().trainData || {};
    // update could be { trainId, data: { ... } } or just the result object
    const payload = update?.data ? update.data : update;

    const merged = {
      ...existing,
      ...payload,
      // preserve nested route if update doesn't include it
      route: payload?.route || existing?.route || [],
      // merge eta object
      eta: {
        ...(existing?.eta || {}),
        ...(payload?.eta || {}),
        ...(payload?.delayMinutes !== undefined
          ? { delayMinutes: payload.delayMinutes }
          : {}),
      },
      // merge prediction if available
      prediction: {
        ...(existing?.prediction || {}),
        ...(payload?.prediction || {}),
        ...(payload?.confidence !== undefined
          ? { confidence: payload.confidence }
          : {}),
      },
    };

    set({
      trainData: merged,
      lastUpdated: new Date().toISOString(),
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setLiveConnected: (isLiveConnected) => set({ isLiveConnected }),

  setHeartbeatAck: (lastHeartbeatAck) => set({ lastHeartbeatAck }),

  setError: (errorMessage) =>
    set({
      errorMessage,
      isLoading: false,
      watchStatus: 'ERROR',
    }),

  clearWatch: () =>
    set({
      watchId: null,
      watchStatus: 'IDLE',
      isLiveConnected: false,
      lastHeartbeatAck: null,
    }),

  resetAll: () =>
    set({
      currentTrainId: '',
      watchId: null,
      watchStatus: 'IDLE',
      trainData: null,
      isLoading: false,
      isLiveConnected: false,
      lastHeartbeatAck: null,
      lastUpdated: null,
      errorMessage: null,
    }),

  addRecentSearch: (trainId, trainName = '') => {
    const trimmedId = String(trainId).trim();
    if (!trimmedId) return;

    const existing = get().recentSearches.filter(
      (item) => item.trainId !== trimmedId
    );
    const updated = [
      {
        trainId: trimmedId,
        trainName: trainName || `Train #${trimmedId}`,
        timestamp: Date.now(),
      },
      ...existing,
    ].slice(0, 6);

    try {
      localStorage.setItem('recent_train_searches', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    set({ recentSearches: updated });
  },

  clearRecentSearches: () => {
    try {
      localStorage.removeItem('recent_train_searches');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
    set({ recentSearches: [] });
  },
}));

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

let socket = null;
let heartbeatTimer = null;

/**
 * Get or initialize the Socket.IO client instance
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      stopHeartbeat();
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
    });
  }

  return socket;
};

/**
 * Connect socket if not connected
 */
export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

/**
 * Join train room and start heartbeats
 * @param {string} watchId
 * @param {string} trainId
 */
export const joinTrainWatch = (watchId, trainId) => {
  const s = connectSocket();

  // If already connected, emit immediately; else wait for connect
  const emitWatch = () => {
    s.emit('watch-train', {
      watchId,
      trainId: String(trainId).trim(),
    });
    console.log(`📤 Emitted watch-train for ${trainId} (watchId: ${watchId})`);
    startHeartbeat(watchId);
  };

  if (s.connected) {
    emitWatch();
  } else {
    s.once('connect', emitWatch);
  }
};

/**
 * Start periodic 15-second heartbeat to keep watch session active
 * @param {string} watchId
 */
export const startHeartbeat = (watchId) => {
  stopHeartbeat();

  if (!watchId) return;

  // Send an immediate heartbeat then schedule interval
  const send = () => {
    if (socket && socket.connected) {
      socket.emit('heartbeat', { watchId });
      console.log(`💓 Sent heartbeat for watchId: ${watchId}`);
    }
  };

  send();
  heartbeatTimer = setInterval(send, 15000);
};

/**
 * Stop heartbeat interval
 */
export const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

/**
 * Stop watching train and cleanup
 * @param {string} watchId
 */
export const leaveTrainWatch = (watchId) => {
  stopHeartbeat();
  if (socket && socket.connected && watchId) {
    socket.emit('stop-watch', { watchId });
    console.log(`⏹️ Sent stop-watch for watchId: ${watchId}`);
  }
};

/**
 * Completely disconnect socket
 */
export const disconnectSocket = () => {
  stopHeartbeat();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

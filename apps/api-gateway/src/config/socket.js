import { Server } from 'socket.io';
import Watch from '../modules/watch/watch.model.js';
import { publishStop } from '../queues/stop.producer.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  console.log('🔌 Socket.IO Server Started');

  io.on('connection', (socket) => {
    console.log(`🔗 Client Connected: ${socket.id}`);

    /*
     * User starts watching a train
     */
    socket.on('watch-train', ({ watchId, trainId }) => {
      if (!watchId || !trainId) {
        socket.emit('error', {
          message: 'watchId and trainId are required',
        });

        return;
      }

      const room = `train:${trainId}`;

      socket.join(room);

      // Store session information on the socket
      socket.watchId = watchId;
      socket.trainId = trainId;

      socket.emit('watch-started', {
        watchId,
        trainId,
      });

      console.log(`👀 ${socket.id} watching train ${trainId}`);
    });

    /*
     * Heartbeat
     */
    socket.on('heartbeat', async ({ watchId }) => {
      if (!watchId || watchId !== socket.watchId) {
        return;
      }

      socket.lastHeartbeat = Date.now();

      try {
        await Watch.findOneAndUpdate(
          { watchId },
          { lastHeartbeat: new Date() }
        );
      } catch (err) {
        console.error('Error updating heartbeat in DB:', err);
      }

      socket.emit('heartbeat-ack', {
        timestamp: Date.now(),
      });
    });

    const cleanupWatch = async (watchId, trainId, reason) => {
      try {
        await Watch.findOneAndUpdate(
          { watchId },
          { status: 'STOPPED', stopReason: reason }
        );

        const activeWatchesCount = await Watch.countDocuments({
          trainId,
          status: 'ACTIVE',
        });

        if (activeWatchesCount === 0) {
          await publishStop(trainId);
        }
      } catch (err) {
        console.error('Error cleaning up watch:', err);
      }
    };

    /*
     * User explicitly stops watching
     */
    socket.on('stop-watch', async ({ watchId }) => {
      if (!watchId || watchId !== socket.watchId) {
        return;
      }

      const trainId = socket.trainId;

      if (trainId) {
        socket.leave(`train:${trainId}`);
        await cleanupWatch(watchId, trainId, 'USER_LEFT');
      }

      socket.emit('watch-stopped', {
        watchId,
        trainId,
      });

      console.log(`⏹️ ${socket.id} stopped watching ${trainId}`);

      socket.watchId = null;
      socket.trainId = null;
      socket.lastHeartbeat = null;
    });

    /*
     * Client disconnected
     */
    socket.on('disconnect', async (reason) => {
      console.log(`🔌 Client Disconnected: ${socket.id} | Reason: ${reason}`);

      if (socket.watchId && socket.trainId) {
        console.log(`⚠️ Watch ended: ${socket.trainId} | ${socket.watchId}`);
        await cleanupWatch(
          socket.watchId,
          socket.trainId,
          'WEBSOCKET_DISCONNECTED'
        );
      }
    });

    /*
     * Socket error
     */
    socket.on('error', (error) => {
      console.error(`🚩 Socket Error [${socket.id}]:`, error.message);
    });
  });

  return io;
};

/*
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }

  return io;
};

/*
 * Broadcast ETA result to everyone
 * watching a specific train.
 */
export const broadcastTrainUpdate = (trainId, result) => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }

  const room = `train:${trainId}`;

  io.to(room).emit('eta-update', {
    trainId,
    data: result,
  });

  console.log(`📡 ETA update broadcasted for train ${trainId}`);
};

/*
 * Get number of active sockets watching
 * a particular train.
 */
export const getTrainWatcherCount = (trainId) => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }

  const room = `train:${trainId}`;
  const roomSockets = io.sockets.adapter.rooms.get(room);

  return roomSockets ? roomSockets.size : 0;
};

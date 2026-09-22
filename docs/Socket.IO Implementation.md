# Socket.IO Implementation

## 1. Purpose

Socket.IO is used in the Train ETA system for **real-time communication between the frontend and API Gateway**.

Instead of repeatedly calling the API to check for ETA updates, the frontend maintains a persistent Socket.IO connection.

```text
Frontend
    │
    │ Socket.IO
    ▼
API Gateway
    │
    ▼
Train-specific Room
```

The ML service does not communicate directly with the frontend.

```text
ML Service
    │
    ▼
RabbitMQ
    │
    ▼
API Gateway
    │
    ▼
Socket.IO
    │
    ▼
Frontend
```

---

# 2. Installation

Install Socket.IO in the API Gateway:

```bash
npm install socket.io
```

For the frontend:

```bash
npm install socket.io-client
```

---

# 3. Socket.IO Server

Create:

```text
src/socket/socket.js
```

```js
import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  console.log("🔌 Socket.IO Server Started");

  io.on("connection", (socket) => {
    console.log(`🔗 Client Connected: ${socket.id}`);

    /*
     * User starts watching a train
     */
    socket.on("watch-train", ({ watchId, trainNumber }) => {
      if (!watchId || !trainNumber) {
        socket.emit("error", {
          message: "watchId and trainNumber are required",
        });

        return;
      }

      const room = `train:${trainNumber}`;

      socket.join(room);

      socket.watchId = watchId;
      socket.trainNumber = trainNumber;
      socket.lastHeartbeat = Date.now();

      socket.emit("watch-started", {
        watchId,
        trainNumber,
      });

      console.log(
        `👀 ${socket.id} watching train ${trainNumber}`
      );
    });

    /*
     * Heartbeat
     */
    socket.on("heartbeat", ({ watchId }) => {
      if (!watchId || watchId !== socket.watchId) {
        return;
      }

      socket.lastHeartbeat = Date.now();

      socket.emit("heartbeat-ack", {
        timestamp: Date.now(),
      });
    });

    /*
     * User explicitly stops watching
     */
    socket.on("stop-watch", ({ watchId }) => {
      if (!watchId || watchId !== socket.watchId) {
        return;
      }

      const trainNumber = socket.trainNumber;

      if (trainNumber) {
        socket.leave(`train:${trainNumber}`);
      }

      socket.emit("watch-stopped", {
        watchId,
        trainNumber,
      });

      console.log(
        `⏹️ ${socket.id} stopped watching ${trainNumber}`
      );

      socket.watchId = null;
      socket.trainNumber = null;
      socket.lastHeartbeat = null;
    });

    /*
     * Client disconnected
     */
    socket.on("disconnect", (reason) => {
      console.log(
        `🔌 Client Disconnected: ${socket.id} | Reason: ${reason}`
      );

      if (socket.watchId && socket.trainNumber) {
        console.log(
          `⚠️ Watch ended: ${socket.trainNumber} | ${socket.watchId}`
        );

        /*
         * Notify the watch/session service here.
         *
         * The service can determine whether there are
         * other active watchers for this train.
         *
         * If no watchers remain:
         *
         * publishEnd(trainNumber)
         */
      }
    });

    /*
     * Socket error
     */
    socket.on("error", (error) => {
      console.error(
        `🚩 Socket Error [${socket.id}]:`,
        error.message
      );
    });
  };

  return io;
};


/*
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }

  return io;
};


/*
 * Broadcast ETA result to everyone
 * watching a specific train.
 */
export const broadcastTrainUpdate = (
  trainNumber,
  result
) => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }

  const room = `train:${trainNumber}`;

  io.to(room).emit("eta-update", {
    trainNumber,
    data: result,
  });

  console.log(
    `📡 ETA update broadcasted for train ${trainNumber}`
  );
};


/*
 * Get number of active watchers
 * for a specific train.
 */
export const getTrainWatcherCount = (trainNumber) => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }

  const room = `train:${trainNumber}`;

  const roomSockets = io.sockets.adapter.rooms.get(room);

  return roomSockets ? roomSockets.size : 0;
};
```

---

# 4. Creating the HTTP + Socket.IO Server

Socket.IO should be attached to the same HTTP server as Express.

Example:

```js
import http from 'http';
import app from './app.js';
import { initializeSocket } from './socket/socket.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

The architecture becomes:

```text
                 HTTP Server
                     │
             ┌───────┴───────┐
             │               │
          Express         Socket.IO
             │               │
          REST API       Real-time
```

---

# 5. Train Rooms

Socket.IO rooms are used to group users watching the same train.

For example:

```text
train:12951
```

can contain:

```text
User A
User B
User C
```

When a user starts watching:

```js
socket.join(`train:${trainNumber}`);
```

Example:

```js
socket.join('train:12951');
```

Now that socket belongs to the `train:12951` room.

---

# 6. Broadcasting ETA Updates

When the ML service produces:

```json
{
  "trainNumber": "12951",
  "eta": "22:42",
  "delayMinutes": 8
}
```

the API Gateway can broadcast:

```js
broadcastTrainUpdate(result.trainNumber, result);
```

Internally:

```js
io.to(`train:${trainNumber}`).emit('eta-update', result);
```

Every user watching that train receives the update.

```text
                 train:12951
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        User A     User B      User C
```

Only one ML result is required for all three users.

---

# 7. Frontend Connection

Install:

```bash
npm install socket.io-client
```

Connect:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  withCredentials: true,
});
```

---

# 8. Start Watching

After the API Gateway creates the `watchId`:

```js
socket.emit('watch-train', {
  watchId: 'watch_001',
  trainNumber: '12951',
});
```

Server:

```text
watch-train
      │
      ▼
socket.join("train:12951")
```

The server responds:

```js
socket.on('watch-started', (data) => {
  console.log('Watching:', data.trainNumber);
});
```

---

# 9. Heartbeat

The frontend periodically sends:

```js
socket.emit('heartbeat', {
  watchId: 'watch_001',
});
```

For example, every 15 seconds:

```js
const heartbeatInterval = setInterval(() => {
  socket.emit('heartbeat', {
    watchId: 'watch_001',
  });
}, 15000);
```

The heartbeat travels through the existing Socket.IO connection.

It does **not** require a separate HTTP request.

---

# 10. Receiving ETA Updates

The frontend listens for:

```js
socket.on('eta-update', (data) => {
  console.log('🚆 ETA Update:', data);

  // Update UI
});
```

Example received data:

```json
{
  "trainNumber": "12951",
  "data": {
    "eta": "22:42",
    "delayMinutes": 8,
    "speed": 82
  }
}
```

---

# 11. Stopping the Watch

When the user explicitly leaves the train screen:

```js
socket.emit('stop-watch', {
  watchId: 'watch_001',
});
```

The server removes the socket from the train room:

```js
socket.leave(`train:${trainNumber}`);
```

The watch/session service can then determine whether ML processing should continue.

---

# 12. Disconnect Handling

If the browser closes unexpectedly:

```text
Browser
   X
Socket.IO
   │
   ▼
disconnect event
```

The server receives:

```js
socket.on('disconnect', (reason) => {
  // Handle watch cleanup
});
```

This is important because the frontend may not always get an opportunity to explicitly send:

```text
stop-watch
```

The backend can therefore clean up the associated watch session.

---

# 13. Heartbeat Timeout

Heartbeat provides an additional safety mechanism.

Example:

```text
Heartbeat interval = 15 seconds
Timeout = 45 seconds
```

If the server doesn't receive a heartbeat for 45 seconds:

```text
No heartbeat
      │
      ▼
Watch considered expired
      │
      ▼
Update train_watches
      │
      ▼
Check remaining watchers
      │
      ▼
No watchers?
      │
      ▼
RabbitMQ → train.eta.stop
```

This prevents abandoned ML jobs.

---

# 14. RabbitMQ + Socket.IO

The complete result flow is:

```text
              ML SERVICE
                   │
                   │ ETA Result
                   ▼
               RabbitMQ
                   │
                   ▼
          result.consumer.js
                   │
                   ▼
             API Gateway
              │        │
              │        │
              ▼        ▼
          MongoDB    Socket.IO
                       │
                       ▼
                 train:12951
                  │    │    │
                  ▼    ▼    ▼
                  A    B    C
```

The ML service never needs to know about:

- WebSocket connections
- Socket.IO rooms
- Users
- Browser sessions

It only processes:

```json
{
  "trainNumber": "12951"
}
```

and returns the train result.

---

# 15. Responsibility Separation

| Component   | Responsibility                         |
| ----------- | -------------------------------------- |
| Frontend    | Connect, watch, heartbeat, display ETA |
| Socket.IO   | Real-time communication                |
| API Gateway | Session and watch management           |
| MongoDB     | Persistent train/watch/result data     |
| RabbitMQ    | API Gateway ↔ ML communication         |
| ML Service  | ETA processing                         |

The important separation is:

```text
watchId
   ↓
API Gateway
   ↓
Identifies the user's watch session
```

while:

```text
trainNumber
   ↓
ML Service
   ↓
Identifies the train being processed
```

The ML service does not need `watchId`.

---

# 16. Final Flow

```text
USER
 │
 │ Train Number
 ▼
FRONTEND
 │
 │ HTTP → Start Watch
 ▼
API GATEWAY
 │
 ├──────► MongoDB
 │
 └──────► RabbitMQ
             │
             ▼
          ML SERVICE
             │
             ▼
          RabbitMQ
             │
             ▼
        API GATEWAY
             │
             ├──────► MongoDB
             │
             └──────► Socket.IO
                         │
                         ▼
                    train:12951
                    │    │    │
                    ▼    ▼    ▼
                  User User User
                    A    B    C
```

**Socket.IO therefore acts as the real-time delivery layer, while RabbitMQ remains the service-to-service messaging layer. They solve two different problems and work together rather than replacing each other.**

# Train ETA System Architecture

## 1. Overview

The Train ETA System is designed to provide real-time train ETA and train-status updates while efficiently managing ML processing resources.

The system follows a service-oriented architecture consisting of:

- Frontend — React + Vite
- API Gateway — Node.js + Express
- Database — MongoDB Atlas
- Message Broker — RabbitMQ
- ML Backend — FastAPI
- Real-time Communication — WebSocket

The system does not currently implement user authentication or login.

The core principle is:

> **HTTP starts the watch → WebSocket maintains the live session → RabbitMQ coordinates ML processing → MongoDB stores persistent data → WebSocket delivers real-time updates → WebSocket disconnection or heartbeat timeout stops unnecessary ML processing.**

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      FRONTEND        │
                         │    React + Vite      │
                         │                      │
                         │  Enter Train Number  │
                         │  View Live ETA       │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                       HTTP                WebSocket
                    Start Watch             Live Updates
                         │                     │
                         ▼                     │
              ┌────────────────────────────────────┐
              │            API GATEWAY              │
              │          Node.js + Express          │
              │                                    │
              │  REST API                           │
              │  WebSocket Manager                  │
              │  Watch Session Manager              │
              └──────────────┬─────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
          ┌────────────────┐    ┌─────────────────┐
          │  MongoDB Atlas │    │    RabbitMQ     │
          │                │    │                 │
          │ train_watches  │    │ eta.start       │
          │ eta_results    │    │ eta.stop        │
          │                │    │ eta.result      │
          └────────────────┘    └────────┬────────┘
                                         │
                                         ▼
                              ┌────────────────────┐
                              │     ML SERVICE      │
                              │       FastAPI       │
                              │                    │
                              │   ETA Processing   │
                              │   Prediction       │
                              └──────────┬─────────┘
                                         │
                                         ▼
                                    RabbitMQ
                                         │
                                         ▼
                              ┌────────────────────┐
                              │    API GATEWAY      │
                              │                    │
                              │ Update MongoDB     │
                              │ Broadcast WebSocket│
                              └──────────┬─────────┘
                                         │
                                    WebSocket
                                         │
                                         ▼
                              ┌────────────────────┐
                              │      FRONTEND       │
                              │                    │
                              │ Live ETA           │
                              │ Train Status       │
                              │ Location           │
                              └────────────────────┘
```

---

# 3. Component Responsibilities

## 3.1 Frontend

**Technology:** React + Vite

The frontend is responsible for:

- Accepting the train number from the user
- Starting a train watch session
- Establishing a WebSocket connection
- Sending heartbeat messages
- Receiving real-time ETA updates
- Displaying train information
- Detecting when the user leaves the train screen
- Closing the WebSocket connection

The frontend should not continuously poll the backend for ETA updates.

Instead, one persistent WebSocket connection is used for the live session.

---

## 3.2 API Gateway

**Technology:** Node.js + Express

The API Gateway acts as the central communication layer between the frontend, MongoDB, RabbitMQ, and ML service.

Responsibilities:

- REST API endpoints
- Train watch session management
- WebSocket connection management
- Heartbeat handling
- Detecting WebSocket disconnections
- Publishing ML start/stop messages
- Consuming ML results
- Updating MongoDB
- Broadcasting ETA results to connected clients

The API Gateway does not perform ML processing itself.

---

## 3.3 MongoDB Atlas

MongoDB is used for persistent application data.

Only two collections are currently required:

```text
MongoDB Atlas
│
├── train_watches
│
└── train_eta_results
```

### `train_watches`

Represents a user's active train-watching session.

It contains information such as:

- `watchId`
- `trainNumber`
- `status`
- `startedAt`
- `lastHeartbeat`
- `stoppedAt`
- `stopReason`

The watch session is independent of the train itself.

Example:

```text
watch_001 → Train 12951
watch_002 → Train 12951
watch_003 → Train 12952
```

---

### `train_eta_results`

Contains the latest complete train information and ML prediction.

It can contain:

- Train number
- Train name
- Source
- Destination
- Current station
- Next station
- Train status
- Delay
- Current location
- Speed
- ETA
- Route information
- ML prediction information
- Model version
- Prediction confidence
- Last updated time

The collection represents the latest known state/result for a train.

For example:

```text
12951
│
├── Current Location
├── Current Station
├── Next Station
├── Delay
├── Speed
├── ETA
├── Route
└── ML Prediction
```

The system does not need to create a new MongoDB document for every real-time update unless historical ETA/prediction data is specifically required.

The existing train document can instead be updated with the latest result.

---

# 4. RabbitMQ

RabbitMQ is used for asynchronous communication between the API Gateway and ML service.

The main message types are:

```text
train.eta.start
train.eta.stop
train.eta.result
```

### `train.eta.start`

Sent when a train starts being actively watched.

Example:

```json
{
  "watchId": "watch_001",
  "trainNumber": "12951"
}
```

---

### `train.eta.stop`

Sent when the train no longer needs to be processed.

Example:

```json
{
  "watchId": "watch_001",
  "trainNumber": "12951",
  "reason": "USER_LEFT"
}
```

---

### `train.eta.result`

Sent by the ML service when a new ETA result is available.

Example:

```json
{
  "trainNumber": "12951",
  "eta": "2026-09-22T17:12:00Z",
  "delayMinutes": 8,
  "confidence": 0.94
}
```

---

# 5. ML Service

**Technology:** FastAPI

The ML service is responsible only for ETA-related processing.

It consumes messages from RabbitMQ.

### Start

```text
RabbitMQ
    │
    │ train.eta.start
    ▼
ML Service
    │
    ▼
Start ETA processing
```

### Processing

The ML service obtains the required train data and performs:

- Data processing
- Feature preparation
- ETA prediction
- Delay prediction
- Location/status processing
- Other ML calculations

### Result

After processing:

```text
ML Service
    │
    ▼
RabbitMQ
    │
    │ train.eta.result
    ▼
API Gateway
```

The API Gateway then updates MongoDB and sends the result to the frontend.

---

# 6. Initial Train Watch Flow

When the user enters a train number:

```text
User
 │
 │ Train Number: 12951
 ▼
Frontend
 │
 │ POST /api/trains/watch
 ▼
API Gateway
 │
 ├──────────────► MongoDB
 │                 Create train_watch
 │
 └──────────────► RabbitMQ
                   train.eta.start
                         │
                         ▼
                    ML Service
```

The API Gateway returns a `watchId`.

Example:

```json
{
  "watchId": "watch_001",
  "trainNumber": "12951",
  "status": "ACTIVE"
}
```

---

# 7. WebSocket Connection

After starting the watch, the frontend establishes a WebSocket connection.

```text
Frontend
    │
    │ WebSocket
    ▼
API Gateway
```

The WebSocket connection remains open while the user is watching the train.

The connection is used for:

- Heartbeats
- ETA updates
- Train status updates
- Location updates
- Other real-time information

No repeated HTTP polling is required.

---

# 8. Heartbeat Mechanism

The frontend periodically sends a heartbeat through the existing WebSocket connection.

Example:

```json
{
  "type": "heartbeat",
  "watchId": "watch_001"
}
```

The heartbeat does not require another HTTP request.

Conceptually:

```text
WebSocket
│
├── heartbeat
├── heartbeat
├── heartbeat
├── ETA update
├── ETA update
└── train status update
```

The API Gateway maintains the latest heartbeat information.

For a first implementation, heartbeat state can be maintained in the API Gateway.

If the system is later scaled to multiple API Gateway instances, Redis can be introduced for shared session/heartbeat state.

---

# 9. Real-Time ETA Flow

When the ML service produces a new result:

```text
ML Service
    │
    │ train.eta.result
    ▼
RabbitMQ
    │
    ▼
API Gateway
    │
    ├──────────────► MongoDB
    │                 Update train_eta_results
    │
    └──────────────► WebSocket
                       │
                       ▼
                    Frontend
```

The frontend immediately receives the updated ETA.

Example:

```json
{
  "type": "ETA_UPDATE",
  "trainNumber": "12951",
  "eta": "22:42",
  "delayMinutes": 8,
  "speed": 82
}
```

The UI can update without making another HTTP request.

---

# 10. User Leaves the Page

When the user navigates away from the train screen:

```text
User leaves page
       │
       ▼
Frontend closes WebSocket
       │
       ▼
API Gateway detects disconnect
       │
       ▼
Stop Watch Session
       │
       ▼
RabbitMQ
       │
       │ train.eta.stop
       ▼
ML Service
       │
       ▼
Stop processing
```

The corresponding `train_watches` document is updated:

```json
{
  "status": "STOPPED",
  "stopReason": "WEBSOCKET_DISCONNECTED"
}
```

---

# 11. Heartbeat Timeout

The system should not rely only on graceful WebSocket disconnection.

A browser may:

- Crash
- Lose network connectivity
- Be closed unexpectedly
- Put the device to sleep
- Lose the WebSocket without sending a clean disconnect

Therefore, the heartbeat acts as a backup.

Example:

```text
Heartbeat interval: ~10–15 seconds
Timeout: ~45 seconds
```

If no heartbeat is received within the timeout:

```text
No heartbeat
      │
      ▼
Watch considered expired
      │
      ▼
train_watches.status = EXPIRED
      │
      ▼
RabbitMQ
      │
      ▼
train.eta.stop
      │
      ▼
ML Service
      │
      ▼
Stop processing
```

---

# 12. Multiple Users Watching the Same Train

The system should avoid running separate ML processes for every user watching the same train.

Example:

```text
User A ──► 12951
User B ──► 12951
User C ──► 12951
```

Instead:

```text
                  Train 12951
                       │
                       ▼
                  One ML Job
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           User A    User B    User C
```

The API Gateway can maintain the number of active watchers for a train.

Conceptually:

```text
12951 → 3 active watchers
```

If User A leaves:

```text
12951 → 2 active watchers
```

ML processing continues.

If User B leaves:

```text
12951 → 1 active watcher
```

ML processing continues.

When the final watcher leaves:

```text
12951 → 0 active watchers
```

The system sends:

```text
train.eta.stop
```

to the ML service.

This prevents unnecessary duplicate ML processing.

---

# 13. Complete System Flow

## Start

```text
Frontend
   │
   │ HTTP
   ▼
API Gateway
   │
   ├──► MongoDB
   │      train_watches
   │
   └──► RabbitMQ
          train.eta.start
                │
                ▼
            ML Service
```

## Live Session

```text
Frontend
    ║
    ║ WebSocket
    ║
    ╠════ heartbeat ═══════════════► API Gateway
    ║
    ║◄════════ ETA update ══════════
    ║
    ║◄════════ location ════════════
    ║
    ║◄════════ train status ════════
```

## ML Result

```text
ML Service
     │
     ▼
RabbitMQ
     │
     ▼
API Gateway
     │
     ├──► MongoDB
     │
     └──► WebSocket
             │
             ▼
          Frontend
```

## Stop

```text
User leaves
     │
     ▼
WebSocket disconnect
     │
     ▼
API Gateway
     │
     ├──► MongoDB
     │      status = STOPPED
     │
     └──► RabbitMQ
             │
             ▼
         ML Service
             │
             ▼
        Stop processing
```

## Unexpected Disconnect

```text
WebSocket lost
      │
      ▼
No heartbeat
      │
      ▼
Heartbeat timeout
      │
      ▼
Watch = EXPIRED
      │
      ▼
RabbitMQ
      │
      ▼
ML Service
      │
      ▼
Stop processing
```

---

# 14. Data Ownership

| Data                              | Component                   |
| --------------------------------- | --------------------------- |
| Train watch session               | MongoDB `train_watches`     |
| Latest complete train information | MongoDB `train_eta_results` |
| WebSocket connection              | API Gateway runtime         |
| Heartbeat state                   | API Gateway runtime         |
| ML start command                  | RabbitMQ                    |
| ML stop command                   | RabbitMQ                    |
| ETA result                        | ML Service → RabbitMQ       |
| Real-time ETA delivery            | API Gateway → WebSocket     |
| ETA prediction                    | ML Service                  |

---

# 15. Final Technology Stack

```text
Frontend
    React
    Vite
    WebSocket Client

Backend
    Node.js
    Express.js
    WebSocket

Database
    MongoDB Atlas
    Mongoose

Message Broker
    RabbitMQ

ML Backend
    FastAPI
    Python
    ML Model
```

---

# 16. Final Architecture Principle

The system follows four main communication patterns:

```text
                 TRAIN ETA SYSTEM

        ┌───────────────────────────────┐
        │                               │
        │        HTTP / REST            │
        │   Start / Query / Commands    │
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
                  API Gateway
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
       MongoDB Atlas             RabbitMQ
                                    │
                                    ▼
                                ML Service
                                    │
                                    ▼
                                RabbitMQ
                                    │
                                    ▼
                              API Gateway
                                    │
                                    ▼
                              WebSocket
                                    │
                                    ▼
                                 Frontend
```

### Core principle

> **HTTP is used for starting and managing operations. WebSocket is used for the persistent real-time session. RabbitMQ is used for asynchronous communication with the ML service. MongoDB stores persistent train-watch and ETA-result data.**

This architecture allows the system to provide real-time train updates while ensuring that ML processing only continues while there are active users watching the train.

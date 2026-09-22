// Server
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Local Configs
import { connectRabbitMQ } from './config/rabbitmq.js';
import { initializeSocket } from './config/socket.js';
import { connectDB } from './config/db.js';

// Local Imports
import logger from './middleware/logger.middleware.js';
import watchRoutes from './modules/watch/watch.route.js';
import resultRoutes from './modules/result/result.route.js';
import healthRoutes from './modules/health/healthcheck.route.js';

// Environment config
dotenv.config({ path: './.env', debug: process.env.DEBUG });

// Setup Express & Server
const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(logger);

// Routes
app.use('/watch', watchRoutes);
app.use('/result', resultRoutes);
app.use('/health', healthRoutes);

// Start the server
await connectRabbitMQ();
initializeSocket(server);
server.listen(PORT, () => {
  console.log('🌐 Server is running on PORT: ' + PORT);
  connectDB();
});

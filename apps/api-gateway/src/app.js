// Server
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Local Imports
import logger from './middleware/logger.middleware.js';

// Environment config
dotenv.config({ path: './.env', debug: process.env.DEBUG });

// Setup Express
const app = express();

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
app.get('/health', async (req, res) => {
  res.status(200).json({ message: '✅ Server is up and running !!' });
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('🌐 Server is running on PORT: ' + PORT);
});

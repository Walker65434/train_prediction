import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🗄️  MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.log('🚩  MongoDB connection error:', error.message);
    process.exit(1); // Note: 1 means failure, 0 means success
  }
};

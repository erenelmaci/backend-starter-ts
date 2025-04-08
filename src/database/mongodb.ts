/* *******************************************************
 * NODEJS PROJECT © 2024 - ITOPIATECH.COM.TR *
 ******************************************************* */

import mongoose from './mongoose';

/* -------------------------------------------------- */

/**
 * MongoDB bağlantısını yöneten fonksiyon
 * @returns Promise<void>
 */
export const connectToMongoDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/* -------------------------------------------------- */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
};

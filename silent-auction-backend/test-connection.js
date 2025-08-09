import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', MONGO_URI.replace(/:[^:@]*@/, ':****@'));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });

// Timeout after 15 seconds
setTimeout(() => {
  console.log('⏰ Connection timeout after 15 seconds');
  process.exit(1);
}, 15000);

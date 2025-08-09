import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Make password optional for Firebase users
  firebaseUid: { type: String, unique: true, sparse: true }, // Add Firebase UID field
  role: { type: String, enum: ['seller', 'bidder', 'admin'], default: 'bidder' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

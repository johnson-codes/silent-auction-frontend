import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seller', 'bidder', 'admin'], default: 'bidder' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

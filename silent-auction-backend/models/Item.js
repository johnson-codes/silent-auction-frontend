import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['Art', 'Electronics', 'Fashion', 'Collectibles'], default: 'Art' }, // Add this line
  imageUrl: String,
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['active', 'ended', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Item", itemSchema);

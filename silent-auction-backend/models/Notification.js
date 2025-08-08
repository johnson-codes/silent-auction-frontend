import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  type: { type: String, enum: ["bid", "end", "outbid"], required: true }, 
  message: { type: String, required: true },
  bidAmount: { type: Number }, // Add bid amount
  itemTitle: { type: String }, // Add item title
  itemImage: { type: String }, // Add item image URL
  isRead: { type: Boolean, default: false }, // Add read status
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);

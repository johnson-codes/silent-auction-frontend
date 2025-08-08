import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/item.js";
import bidRoutes from "./routes/bid.js";

import path from "path";
import { fileURLToPath } from 'url';

import notificationRoutes from "./routes/notification.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res) => res.status(404).json({ message: "Not Found" }));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jamnorip:s8LESHNvGj1RtRPm@cluster0.u2mw6ry.mongodb.net/silence_auction_database?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected:", mongoose.connection.name);
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

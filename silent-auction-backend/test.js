import mongoose from "mongoose";
import User from "./models/User.js";
import Item from "./models/Item.js";
import Bid from "./models/Bid.js";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb://localhost:27017/silent_auction";

async function seed() {
  await mongoose.connect(MONGO_URI);

  await User.deleteMany({});
  await Item.deleteMany({});
  await Bid.deleteMany({});

  const alicePwd = await bcrypt.hash("123456", 10);
  const bobPwd = await bcrypt.hash("abcdef", 10);

  const alice = await User.create({ name: "Alice Seller", email: "alice@example.com", password: alicePwd, role: "seller" });
  const bob = await User.create({ name: "Bob Bidder", email: "bob@example.com", password: bobPwd, role: "bidder" });

  const item = await Item.create({
    sellerId: alice._id,
    title: "iPhone 15",
    description: "Brand new iPhone 15, 128GB.",
    imageUrl: "https://example.com/iphone.jpg",
    startingBid: 500,
    currentBid: 500,
    deadline: new Date("2025-12-31T23:59:59Z"),
    status: "active"
  });

  await Bid.create({
    itemId: item._id,
    bidderId: bob._id,
    amount: 550,
    createdAt: new Date("2025-07-01T12:00:00Z")
  });

  console.log("测试数据已插入。");
  await mongoose.disconnect();
}

seed();

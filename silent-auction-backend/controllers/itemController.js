import Item from "../models/Item.js";
import Notification from "../models/Notification.js";

// export async function createItem(req, res) {
//   try {
//     const item = new Item({ ...req.body, currentBid: req.body.startingBid });
//     await item.save();
//     res.status(201).json(item);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// }

import mongoose from "mongoose";

export async function getItems(req, res) {
  try {
    const filter = { status: "active" };
    if (req.query.sellerId) {
      // 强制把 sellerId 转为 ObjectId 类型
      filter.sellerId = new mongoose.Types.ObjectId(req.query.sellerId);
    }
    const items = await Item.find(filter)
      .populate("sellerId", "name")
      .sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getItem(req, res) {
  try {
    const item = await Item.findById(req.params.id).populate("sellerId", "name");
    res.json(item);
  } catch (err) {
    res.status(404).json({ message: "Item not found" });
  }
}

export async function endAuction(req, res) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.status = "ended";
    await Notification.create({
      userId: item.sellerId,
      itemId: item._id,
      type: "end",
      message: `Auction ended for your item: ${item.title}`,
      itemTitle: item.title,
      itemImage: item.imageUrl,
      isRead: false,
      createdAt: new Date()
    });
    await item.save();
    res.json({ message: "Auction ended" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function createItem(req, res) {
  try {
    // 图片已被 multer 存在 req.file
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`   // 生成静态资源URL
      : req.body.imageUrl || "";          // 兼容无图片上传

    const item = new Item({
      sellerId: req.body.sellerId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      imageUrl,
      startingBid: req.body.startingBid,
      currentBid: req.body.startingBid,
      deadline: req.body.deadline,
      status: "active",
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

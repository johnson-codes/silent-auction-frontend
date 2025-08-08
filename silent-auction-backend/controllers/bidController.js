import Bid from "../models/Bid.js";
import Item from "../models/Item.js";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
// 创建出价
export async function createBid(req, res) {
  const { itemId, bidderId, amount } = req.body;
  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.status !== "active") return res.status(400).json({ message: "Auction is not active" });
    if (amount <= item.currentBid) return res.status(400).json({ message: "Bid must be higher than current bid" });

    // Find the previous highest bidder (if any)
    const previousHighestBid = await Bid.findOne({ itemId }).sort({ amount: -1 });
    
    const bid = new Bid({ itemId, bidderId, amount });
    await bid.save();
    item.currentBid = amount;
    await item.save();

    // Notify the item owner about the new bid
    if (item.sellerId && String(item.sellerId) !== String(bidderId)) { 
      await Notification.create({
        userId: item.sellerId,
        itemId: item._id,
        type: "bid",
        message: `Someone placed a new bid on your item: ${item.title}`,
        bidAmount: amount,
        itemTitle: item.title,
        itemImage: item.imageUrl,
        isRead: false,
        createdAt: new Date()
      });
    }

    // Notify the previous highest bidder that they've been outbid
    if (previousHighestBid && 
        String(previousHighestBid.bidderId) !== String(bidderId) && 
        String(previousHighestBid.bidderId) !== String(item.sellerId)) {
      await Notification.create({
        userId: previousHighestBid.bidderId,
        itemId: item._id,
        type: "outbid",
        message: `You have been outbid on "${item.title}". New bid: $${amount}`,
        bidAmount: amount,
        itemTitle: item.title,
        itemImage: item.imageUrl,
        isRead: false,
        createdAt: new Date()
      });
    }

    res.status(201).json({ message: "Bid successful", bid });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// 查某商品所有出价
export async function getBidsByItem(req, res) {
  try {
    const bids = await Bid.find({ itemId: req.params.itemId }).sort({ amount: -1 }).populate("bidderId", "name");
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 查某用户所有出价过的商品
export async function getBidsByUser(req, res) {
  const { userId } = req.params;
  try {
    const bids = await Bid.aggregate([
      { $match: { bidderId: new mongoose.Types.ObjectId(userId) } },  //
      { $group: { _id: "$itemId", maxAmount: { $max: "$amount" } } }
    ]);
    const itemIds = bids.map(b => b._id);
    const items = await Item.find({ _id: { $in: itemIds } });
    const result = items.map(item => {
      const bid = bids.find(b => String(b._id) === String(item._id));
      return {
        ...item.toObject(),
        userMaxBid: bid ? bid.maxAmount : null
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
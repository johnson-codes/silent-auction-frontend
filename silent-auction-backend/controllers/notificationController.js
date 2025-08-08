import Notification from "../models/Notification.js";

export async function getNotificationsByUser(req, res) {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get unread notification count
export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      userId: req.params.userId,
      isRead: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
  try {
    await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true }
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

import express from "express";
import { getNotificationsByUser, getUnreadCount, markNotificationAsRead } from "../controllers/notificationController.js";
const router = express.Router();

router.get("/user/:userId", getNotificationsByUser);
router.get("/:userId/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;
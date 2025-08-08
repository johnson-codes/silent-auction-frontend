import { Router } from "express";
import { createBid, getBidsByItem, getBidsByUser } from "../controllers/bidController.js";
const router = Router();

router.post("/", createBid);
router.get("/item/:itemId", getBidsByItem);
router.get("/user/:userId", getBidsByUser);

export default router;

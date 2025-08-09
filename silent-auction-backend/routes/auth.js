import { Router } from "express";
import { register, login, syncFirebaseUser } from "../controllers/authController.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/sync-firebase", syncFirebaseUser);

export default router;

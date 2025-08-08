// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import { createItem, getItems, getItem, endAuction } from "../controllers/itemController.js";
// const router = Router();

// router.post("/", createItem);
// router.get("/", getItems);
// router.get("/:id", getItem);
// router.patch("/:id/end", endAuction);

// export default router;

import { Router } from "express";
import multer from "multer";
import { createItem, getItems, getItem, endAuction } from "../controllers/itemController.js";
const router = Router();

// 配置 multer 存储图片到 uploads 文件夹
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // 保证唯一性，可用 Date.now
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/", upload.single("image"), createItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.patch("/:id/end", endAuction);

export default router;


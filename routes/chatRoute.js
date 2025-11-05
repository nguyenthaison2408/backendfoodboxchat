import express from "express";
import multer from "multer";
import { handleChat, handleImageAnalysis } from "../controllers/AIController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", handleChat);
router.post("/image", upload.single("image"), handleImageAnalysis);

export default router;

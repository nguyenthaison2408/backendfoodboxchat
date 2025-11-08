import 'dotenv/config';
import express from "express";
import cors from "cors";
import multer from "multer";
import { handleChat, handleImageAnalysis } from "./controllers/AIController.js";

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(cors());          // Cho phép frontend gọi API khác port
app.use(express.json());  // Parse JSON body

// Debug: kiểm tra GEMINI_API_KEY
console.log(
  "🔑 GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Not Found"
);

// ===================== ROUTES =====================
// Chat text với Gemini 2.0 Flash
app.post("/chat", handleChat);

// Phân tích ảnh với Gemini 2.0 Flash
app.post("/image-analysis", upload.single("file"), handleImageAnalysis);

// Test route
app.get("/", (req, res) => res.send("Server is running ✅"));

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

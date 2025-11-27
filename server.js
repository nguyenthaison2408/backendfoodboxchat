import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import chataiRouter from "./routes/chatai.js";
// 1. Import route mới
import imageAnalysisRouter from "./routes/imageAnalysis.js"; 

const app = express();

app.use(cors()); 
app.use(express.json());

// Kiểm tra thư mục uploads, nếu chưa có thì tạo (để tránh lỗi multer)
import fs from 'fs';
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

console.log(
  "🔑 GEMINI_API_KEY Status:",
  process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Not Found"
);

// Routes
app.use("/api/chatai", chataiRouter);
// 2. Đăng ký endpoint mới
app.use("/api/image-analysis", imageAnalysisRouter);

app.get("/", (req, res) => res.send("FoodAI Backend Server is running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
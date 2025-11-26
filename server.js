import 'dotenv/config'; 
import express from "express";
import cors from "cors";
// Đây là import đúng: Chúng ta cần nhập router chat từ routes/chatai.js
import chataiRouter from "./routes/chatai.js"; 

const app = express();

// Middleware
app.use(cors()); // cho phép React localhost:3000 gọi
app.use(express.json());

// Kiểm tra Key sau khi dotenv/config đã chạy
console.log(
  "🔑 GEMINI_API_KEY Status:",
  process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Not Found. Vui lòng kiểm tra file .env"
);

// Routes
// Endpoint cho Chat AI
app.use("/api/chatai", chataiRouter);

// Test route
app.get("/", (req, res) => res.send("FoodAI Backend Server is running ✅"));


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
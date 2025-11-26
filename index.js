import 'dotenv/config'; // Dùng cách này để đảm bảo biến môi trường được load
import express from "express";
import cors from "cors";
import chataiRouter from "./routes/chatai.js";

const app = express();

// --- Middleware ---
// Cấu hình CORS. Trong môi trường dev, allow * là nhanh nhất. 
// Trong môi trường production, nên chỉ cho phép origin của frontend.
app.use(cors()); 
app.use(express.json());

// Kiểm tra Key sau khi dotenv/config đã chạy
console.log(
  "🔑 GEMINI_API_KEY Status:",
  process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Not Found. Vui lòng kiểm tra file .env"
);

// --- Routes ---
// Endpoint: POST /api/chatai
app.use("/api/chatai", chataiRouter);

// Test route
app.get("/", (req, res) => res.send("FoodAI Backend Server is running ✅"));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
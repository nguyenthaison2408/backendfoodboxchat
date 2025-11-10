// controllers/AIController.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Khởi tạo client Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "YOUR_API_KEY",
});

// ======== LOAD DATASET ========
const datasetPath = path.resolve('./data/food_dataset.json');
let foodDataset = [];
try {
  foodDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  console.log(`📚 Loaded food dataset: ${foodDataset.length} món`);
} catch (err) {
  console.error("❌ Lỗi load dataset:", err.message);
}

// ===================== TEXT CHAT =====================
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message trống" });

    console.log("📩 Nhận message:", message);

    const prompt = `
Bạn là FoodAI – chuyên gia ẩm thực Việt Nam.
Dữ liệu món ăn hiện có:
${JSON.stringify(foodDataset, null, 2)}

Người dùng hỏi: "${message}"
Hãy trả lời chi tiết, giải thích dinh dưỡng, thành phần, và gợi ý các món ăn tương tự.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response?.text || "⚠️ AI không trả lời.";
    console.log("💡 Trả lời:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi AI:", err);
    res.status(500).json({ error: "AI request failed", details: err.message || err });
  }
};

// ===================== IMAGE ANALYSIS =====================
export const handleImageAnalysis = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Không có file được upload" });

    const filePath = req.file.path;
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });
    fs.unlinkSync(filePath); // Xóa file sau khi đọc
    console.log("📸 Đã nhận ảnh:", req.file.originalname);

    const promptText = `
Bạn là FoodAI – chuyên gia ẩm thực.
Dữ liệu món ăn hiện có:
${JSON.stringify(foodDataset, null, 2)}

Hình ảnh dưới đây là món ăn:
[IMAGE_BASE64]
${imageBase64}

Hãy phân tích món ăn, đưa thông tin dinh dưỡng, thành phần, và gợi ý các món ăn tương tự.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
    });

    const reply = response?.text || "⚠️ AI không trả lời.";
    console.log("💡 Trích xuất reply từ ảnh:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi xử lý ảnh:", err);
    res.status(500).json({ error: "Image analysis failed", details: err.message || err });
  }
};

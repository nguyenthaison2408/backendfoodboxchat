// controllers/AIController.js
import 'dotenv/config';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

// Khởi tạo client Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "YOUR_API_KEY", // thay YOUR_API_KEY nếu muốn hardcode
});

// ===================== TEXT CHAT =====================
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Nhận message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message trống" });
    }

    console.log("💬 Gửi request tới Gemini 2.5 Flash...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    const reply = response?.text || "⚠️ AI không trả lời.";
    console.log("💡 Trích xuất reply:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi AI:", err);
    res.status(500).json({ error: "AI request failed", details: err.message || err });
  }
};

// ===================== IMAGE CHAT =====================
export const handleImageAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    const filePath = req.file.path;
    const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });
    fs.unlinkSync(filePath); // xóa file sau khi đọc
    console.log("📸 Đã nhận ảnh:", req.file.originalname);

    const promptText = `Hãy phân tích món ăn trong ảnh dưới đây và tư vấn dinh dưỡng, gợi ý các món tương tự.\n[IMAGE_BASE64]\n${imageBase64}`;

    console.log("💬 Gửi request phân tích ảnh tới Gemini 2.5 Flash...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
    });

    const reply = response?.text || "⚠️ AI không trả lời.";
    console.log("💡 Trích xuất reply:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi xử lý ảnh:", err);
    res.status(500).json({ error: "Image analysis failed", details: err.message || err });
  }
};

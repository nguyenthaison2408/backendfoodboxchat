import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Lỗi: Thiếu GEMINI_API_KEY");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const systemInstruction = `
Bạn là FoodAI, trợ lý dinh dưỡng chuyên nghiệp.
- Trả lời ngắn gọn, thân thiện bằng Tiếng Việt.
- Sử dụng Markdown để trình bày (dùng bảng cho giá trị dinh dưỡng).
- Nhiệm vụ: Tính calo, gợi ý món ăn, sửa công thức, giải đáp dinh dưỡng.
`;

router.post("/", async (req, res) => {
  if (!genAI) return res.status(503).json({ error: "AI Service Unavailable" });

  try {
    const { message, history } = req.body; // Nhận tin nhắn mới và lịch sử cũ
    if (!message) return res.status(400).json({ error: "Message required" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 1. Chuyển đổi lịch sử chat của Frontend sang format của Gemini
    // Frontend: [{role: 'user', text: '...'}, {role: 'ai', text: '...'}]
    // Gemini:   [{role: 'user', parts: [{text: '...'}]}, {role: 'model', parts: [{text: '...'}]}]
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // 2. Khởi tạo phiên chat với lịch sử
    const chatSession = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
      systemInstruction: { parts: [{ text: systemInstruction }] },
      // Google Search Grounding (Tuỳ chọn, có thể tắt nếu muốn phản hồi nhanh hơn)
      tools: [{ google_search: {} }], 
    });

    // 3. Gửi tin nhắn mới
    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    res.json({ output: responseText });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "Lỗi xử lý AI", details: err.message });
  }
});

export default router;
import axios from "axios";
import fs from "fs";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Nhận message:", message);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + process.env.GEMINI_API_KEY,
      { contents: [{ parts: [{ text: message }] }] }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Không có phản hồi từ AI.";
    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi AI:", err.response?.data || err.message);
    res.status(500).json({ error: "AI request failed" });
  }
};

export const handleImageAnalysis = async (req, res) => {
  try {
    const filePath = req.file.path;
    const image = fs.readFileSync(filePath, { encoding: "base64" });

    console.log("📸 Đã nhận ảnh:", req.file.originalname);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [
              { text: "Hãy phân tích món ăn trong ảnh và tư vấn dinh dưỡng, món tương tự." },
              { inline_data: { mime_type: req.file.mimetype, data: image } }
            ]
          }
        ]
      }
    );

    fs.unlinkSync(filePath);
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Không có phản hồi từ AI.";
    res.json({ reply });
  } catch (err) {
    console.error("❌ Lỗi xử lý ảnh:", err.response?.data || err.message);
    res.status(500).json({ error: "Image analysis failed" });
  }
};

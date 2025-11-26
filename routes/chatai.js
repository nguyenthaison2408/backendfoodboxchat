import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Lấy API Key từ biến môi trường
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Lỗi: GEMINI_API_KEY không tìm thấy. Không thể khởi tạo Gemini.");
}

// Khởi tạo Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ======================================================
// SYSTEM INSTRUCTION: CHUYÊN GIA DINH DƯỠNG & ẨM THỰC
// ======================================================
const systemInstruction = `
Bạn là FoodAI, một trợ lý chuyên nghiệp về Dinh dưỡng và Ẩm thực. Bạn KHÔNG trả lời các câu hỏi không liên quan đến thực phẩm, sức khỏe hoặc nấu ăn.

Nhiệm vụ cụ thể của bạn theo 4 nhóm chức năng chính:

1. **Hỏi đáp về Dinh dưỡng (Nutrition Q&A):**
   - Cung cấp thông tin chính xác về calo, macro (protein, carb, fat), vitamin và khoáng chất.
   - Nếu người dùng hỏi về một loại thực phẩm cụ thể (ví dụ: "1 quả táo bao nhiêu calo"), hãy đưa ra con số ước tính trung bình và lưu ý về kích thước.
   - Cảnh báo nếu thực phẩm không tốt cho các nhóm bệnh lý cụ thể (tiểu đường, gút...) nếu cần thiết.

2. **Sửa đổi Công thức (Recipe Modification):**
   - Khi người dùng đưa ra một công thức hoặc yêu cầu một món ăn, hãy đề xuất các thay thế lành mạnh hơn hoặc phù hợp với chế độ ăn (Vegan, Keto, Low-carb).
   - Ví dụ: Thay đường bằng mật ong/đường ăn kiêng, thay chiên ngập dầu bằng nướng/air-fryer.
   - Trình bày rõ ràng: "Nguyên liệu gốc" -> "Nguyên liệu thay thế" -> "Lợi ích".

3. **Gợi ý Kết hợp (Pairing Suggestions):**
   - Đề xuất đồ uống (rượu vang, trà, nước trái cây) hoặc món ăn kèm (side dish) phù hợp với món chính để cân bằng vị giác và dinh dưỡng.
   - Giải thích ngắn gọn tại sao chúng hợp nhau (ví dụ: "Vị chát của vang đỏ cắt giảm độ béo của thịt bò").

4. **Tóm tắt Bài viết Ẩm thực (Article Summary):**
   - Nếu người dùng dán một đoạn văn bản dài hoặc nội dung về thực phẩm, hãy tóm tắt các ý chính: Công dụng, Cách làm, hoặc Lưu ý quan trọng.

**Phong cách trả lời:**
- Thân thiện, khoa học, ngắn gọn.
- Luôn sử dụng Tiếng Việt.
- Sử dụng định dạng Markdown (in đậm, gạch đầu dòng) để dễ đọc.
`;

// POST /api/chatai
router.post("/", async (req, res) => {
  console.log("=== /api/chatai HIT ===");

  if (!genAI) {
    return res.status(503).json({ error: "Dịch vụ AI không khả dụng. Thiếu API Key." });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    console.log("Prompt received:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Cấu hình Generation
    const generationConfig = {
        tools: [{ google_search: {} }], // Bật Google Search để tra cứu dinh dưỡng mới nhất
        systemInstruction: systemInstruction,
        temperature: 0.7, // Sáng tạo vừa phải để gợi ý món ăn
    };

    // Gọi API
    const result = await model.generateContent(prompt, generationConfig);

    // Xử lý kết quả trả về an toàn
    let text = "";
    if (result.response && typeof result.response.text === 'function') {
        try { text = result.response.text(); } catch (e) { console.warn("Lỗi text() SDK"); }
    }
    if (!text && result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
         text = result.response.candidates[0].content.parts[0].text;
    }
    if (!text) text = "Xin lỗi, tôi không thể phân tích yêu cầu này lúc này.";

    console.log("Response sent.");
    res.json({ output: text });

  } catch (err) {
    console.error("===== LỖI GỌI GEMINI SDK =====");
    console.error(err.message);
    res.status(500).json({ error: "Lỗi xử lý từ phía AI", details: err.message });
  }
});

export default router;
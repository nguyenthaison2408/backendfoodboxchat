import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// GET /api/search-dish?q=...
router.get("/", async (req, res) => {
  const { q } = req.query;

  if (!q) return res.status(400).json({ dishes: [] });
  if (!genAI) return res.status(503).json({ error: "Gemini API chưa sẵn sàng." });

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Bạn là một công cụ tìm kiếm ẩm thực thông minh. Hãy phân tích truy vấn: "${q}".
      
      Xác định ý định người dùng (Tìm theo nguyên liệu / Cảm xúc / So sánh / Tìm món cụ thể) và gợi ý 3-5 món ăn phù hợp nhất.
      
      Trả về kết quả JSON theo cấu trúc sau (Tiếng Việt):
      {
        "dishes": [
          {
            "id": "tạo_id_ngẫu_nhiên",
            "name": "Tên món ăn",
            "calories": "Số calo ước tính (vd: 450 kcal)",
            "description": "Mô tả ngắn gọn hương vị và lý do tại sao món này phù hợp với truy vấn.",
            "cooking_time": "Thời gian nấu (vd: 30 phút)",
            "tags": ["tag1", "tag2"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonResponse = JSON.parse(result.response.text());

    // Thêm hình ảnh placeholder dựa trên tên món ăn (vì Gemini không tạo URL ảnh thật)
    const dishesWithImages = jsonResponse.dishes.map(dish => ({
        ...dish,
        imageUrl: `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(dish.name)}`
    }));

    res.json({ dishes: dishesWithImages });

  } catch (err) {
    console.error("Search Dish Error:", err);
    res.status(500).json({ dishes: [], error: err.message });
  }
});

export default router;
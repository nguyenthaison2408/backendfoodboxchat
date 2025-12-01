import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// GET /api/search-dish?q=... (Tìm kiếm tóm tắt)
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
      Bạn là công cụ tìm kiếm ẩm thực. Phân tích: "${q}".
      Gợi ý 3-5 món ăn phù hợp nhất (Tìm theo nguyên liệu/Cảm xúc/So sánh).
      
      Trả về JSON (Tiếng Việt):
      {
        "dishes": [
          {
            "id": "tạo_id_unique",
            "name": "Tên món ăn",
            "calories": "350 kcal",
            "description": "Mô tả ngắn 1 câu hấp dẫn.",
            "cooking_time": "30 phút",
            "tags": ["tag1", "tag2"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const jsonResponse = JSON.parse(result.response.text());

    const dishesWithImages = jsonResponse.dishes.map(dish => ({
        ...dish,
        imageUrl: `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(dish.name)}`
    }));

    res.json({ dishes: dishesWithImages });

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ dishes: [], error: err.message });
  }
});

// GET /api/search-dish/details?dishName=... (Tạo công thức chi tiết)
router.get("/details", async (req, res) => {
    const { dishName } = req.query;
  
    if (!dishName) return res.status(400).json({ error: "Thiếu tên món ăn" });
    if (!genAI) return res.status(503).json({ error: "Gemini API Error" });
  
    try {
      const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
      });
  
      const prompt = `
        Hãy đóng vai một đầu bếp chuyên nghiệp. Tạo công thức chi tiết cho món: "${dishName}".
        
        Trả về JSON chi tiết (Tiếng Việt):
        {
          "intro": "Đoạn giới thiệu ngắn về nguồn gốc hoặc hương vị",
          "ingredients": [
             { "item": "Thịt bò", "amount": "200g" },
             { "item": "Hành tây", "amount": "1 củ" }
          ],
          "steps": [
             "Bước 1: Sơ chế nguyên liệu...",
             "Bước 2: Xào thịt bò..."
          ],
          "nutrition_info": {
             "calories": "...",
             "protein": "...",
             "fat": "...",
             "carbs": "..."
          },
          "tips": "Mẹo nhỏ để món ăn ngon hơn"
        }
      `;
  
      const result = await model.generateContent(prompt);
      const recipeData = JSON.parse(result.response.text());
  
      res.json(recipeData);
  
    } catch (err) {
      console.error("Recipe Details Error:", err);
      res.status(500).json({ error: "Không thể tạo công thức." });
    }
  });

export default router;
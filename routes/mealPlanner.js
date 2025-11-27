import express from "express";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const router = express.Router();

// Lấy API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ==========================================
// 1. Endpoint: Tạo Kế hoạch Bữa ăn (Full Plan)
// ==========================================
router.post("/", async (req, res) => {
  if (!genAI) return res.status(503).json({ error: "Gemini API chưa sẵn sàng." });

  try {
    const { calories, goal, diet, days = 7 } = req.body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      // Quan trọng: Ép kiểu trả về là JSON để Frontend dễ xử lý
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Bạn là một chuyên gia dinh dưỡng. Hãy tạo một kế hoạch bữa ăn chi tiết trong ${days} ngày cho người dùng Việt Nam với các thông số sau:
      - Mục tiêu: ${goal} (Ví dụ: Giảm cân, Tăng cơ, Duy trì)
      - Calo mục tiêu: ${calories} kcal/ngày
      - Chế độ ăn: ${diet} (Ví dụ: Bình thường, Keto, Vegan, Eat Clean)

      Yêu cầu đầu ra JSON:
      {
        "week_plan": [
          {
            "day": 1,
            "meals": [
              { "type": "Sáng", "name": "Tên món", "calories": 500, "ingredients": ["nguyên liệu 1", "nguyên liệu 2"] },
              { "type": "Trưa", "name": "...", "calories": ..., "ingredients": [...] },
              { "type": "Tối", "name": "...", "calories": ..., "ingredients": [...] },
              { "type": "Phụ", "name": "...", "calories": ..., "ingredients": [...] }
            ]
          }
        ],
        "shopping_list": {
           "Rau củ": ["item1", "item2"],
           "Thịt cá": ["item1", "item2"],
           "Gia vị/Khác": ["item1"]
        }
      }
      Lưu ý: Tên món ăn và nguyên liệu phải bằng Tiếng Việt. Phải đa dạng món ăn, không lặp lại quá nhiều.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON từ text trả về
    const planData = JSON.parse(responseText);

    res.json(planData);

  } catch (error) {
    console.error("Lỗi tạo Meal Plan:", error);
    res.status(500).json({ error: "Không thể tạo kế hoạch.", details: error.message });
  }
});

// ==========================================
// 2. Endpoint: Đổi món (Swap Dish)
// ==========================================
router.post("/swap", async (req, res) => {
    if (!genAI) return res.status(503).json({ error: "Gemini API chưa sẵn sàng." });
  
    try {
      const { currentDish, reason, calories, diet } = req.body;
  
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
  
      const prompt = `
        Người dùng muốn đổi món ăn "${currentDish}" trong thực đơn ${diet} (${calories} kcal).
        Lý do đổi: "${reason}".
        Hãy gợi ý 1 món ăn thay thế khác biệt hoàn toàn nhưng vẫn đảm bảo dinh dưỡng tương đương.
        
        Trả về JSON duy nhất:
        {
          "name": "Tên món mới",
          "calories": 500,
          "ingredients": ["nguyên liệu 1", "nguyên liệu 2"],
          "reason_for_change": "Giải thích ngắn gọn tại sao món này phù hợp"
        }
      `;
  
      const result = await model.generateContent(prompt);
      const dishData = JSON.parse(result.response.text());
  
      res.json(dishData);
  
    } catch (error) {
      console.error("Lỗi đổi món:", error);
      res.status(500).json({ error: "Không thể đổi món.", details: error.message });
    }
  });

export default router;
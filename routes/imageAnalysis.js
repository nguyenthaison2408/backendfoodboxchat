import express from "express";
import multer from "multer";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Cấu hình Multer để lưu ảnh tạm thời
const upload = multer({ dest: "uploads/" });

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm helper chuyển file sang định dạng Gemini chấp nhận
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

// POST /api/image-analysis
router.post("/", upload.single("image"), async (req, res) => {
  console.log("=== /api/image-analysis HIT ===");

  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng tải lên một hình ảnh." });
  }

  try {
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    console.log("Đang phân tích ảnh:", req.file.originalname);

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        // Quan trọng: Ép kiểu trả về là JSON để frontend dễ render
        generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Bạn là một chuyên gia AI về thực phẩm. Hãy phân tích hình ảnh này và trả về kết quả dưới dạng JSON với cấu trúc sau:
      {
        "dish_name": "Tên món ăn (Tiếng Việt)",
        "identification": "Mô tả ngắn về món ăn này",
        "ingredients": ["Nguyên liệu 1", "Nguyên liệu 2", "Nguyên liệu 3"],
        "nutrition": {
          "calories": "Số calo ước tính (ví dụ: 350 kcal)",
          "protein": "Lượng đạm (ví dụ: 20g)",
          "fat": "Lượng chất béo",
          "carbs": "Lượng tinh bột"
        },
        "freshness": {
          "score": "Điểm độ tươi từ 1-10 (nếu là trái cây/rau củ, nếu món nấu chín thì để null)",
          "status": "Đánh giá độ tươi (ví dụ: Rất tươi, Hơi héo)",
          "tips": "Mẹo bảo quản (nếu là thực phẩm tươi sống)"
        },
        "recipe_suggestion": "Gợi ý sơ lược cách làm hoặc link tìm kiếm"
      }
      Nếu không phải là đồ ăn, hãy trả về JSON với field "error": "Không nhận diện được thực phẩm".
    `;

    const imagePart = fileToGenerativePart(filePath, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Response:", text);

    // Xóa file ảnh tạm sau khi xử lý xong để giải phóng bộ nhớ
    fs.unlinkSync(filePath);

    // Parse JSON và trả về
    const jsonResponse = JSON.parse(text);
    res.json(jsonResponse);

  } catch (error) {
    console.error("Lỗi xử lý ảnh:", error);
    // Cố gắng xóa file nếu có lỗi xảy ra
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Lỗi phân tích hình ảnh", details: error.message });
  }
});

export default router;
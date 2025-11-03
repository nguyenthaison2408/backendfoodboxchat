import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import foods from "./data/foods.json" assert { type: "json" };
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `
Bạn là chuyên gia tư vấn dinh dưỡng AI. 
Hãy gợi ý món ăn phù hợp theo nhu cầu, khẩu vị hoặc tình trạng sức khỏe người dùng.
Trả lời ngắn gọn, tự nhiên, thân thiện như người thật.
`;

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.choices[0].message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI server error" });
  }
});
app.post("/recommend", (req, res) => {
  const { goal } = req.body;
  let filtered = foods;

  if (goal.includes("giảm cân")) filtered = foods.filter(f => f.phu_hop === "giảm cân");
  if (goal.includes("vận động")) filtered = foods.filter(f => f.phu_hop === "người vận động");
  if (goal.includes("sáng")) filtered = foods.filter(f => f.buoi === "sáng");

  res.json(filtered.slice(0, 3));
});
app.post("/smartchat", async (req, res) => {
  const { message } = req.body;
  const related = foods.filter(f =>
    message.includes("giảm cân") ? f.phu_hop === "giảm cân" : true
  );

  const prompt = `
  Người dùng hỏi: "${message}".
  Dưới đây là danh sách món ăn phù hợp:
  ${related.map(f => `- ${f.ten} (${f.calo} calo, ${f.dinhduong})`).join("\n")}
  Hãy gợi ý thực đơn phù hợp nhất và giải thích ngắn gọn lý do.
  `;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    }
  );

  res.json(response.data.choices[0].message);
});


app.listen(5000, () => console.log("🚀 Server chạy tại http://localhost:5000"));

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("API_KEY loaded:", process.env.API_KEY ? "YES" : "NO");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Model loaded:", model?.name || "unknown");

    const prompt = "Write a short description of a pizza in 2 sentences.";
    const result = await model.generateContent(prompt);

    console.log("Raw result:", result);
    console.log("Text:", result.response?.text?.() || "No text returned");
  } catch (err) {
    console.error("Gemini SDK error:", err.message);
    console.error(err.stack);
  }
}

test();

import express from "express";
import { db } from "../firebase.js";
import fetch from "node-fetch";
const router = express.Router();
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post("/", async (req, res) => {
  if (!req.body.image) return res.status(400).json({ error: "No image provided" });

  try {
    const imageBuffer = Buffer.from(req.body.image, "base64");

    const response = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/clip-vit-base-patch32", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream"
      },
      body: imageBuffer
    });
    const queryEmbedding = await response.json();

    const snapshot = await db.collection("dishes").get();
    const dishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const cosineSim = (a, b) => {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const ranked = dishes
      .map(d => ({ ...d, score: cosineSim(queryEmbedding, d.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({ dishes: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search" });
  }
});

export default router;

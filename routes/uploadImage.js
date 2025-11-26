import express from "express";
import multer from "multer";
import { bucket, db } from "../firebase.js";
import fetch from "node-fetch";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const fileName = `dishes/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);
    await file.save(req.file.buffer, { contentType: req.file.mimetype });
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // CLIP Embedding
    const response = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/clip-vit-base-patch32", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream"
      },
      body: req.file.buffer
    });
    const embedding = await response.json();

    const dishRef = await db.collection("dishes").add({
      name: "Unknown Dish",
      imageUrl,
      embedding,
      createdAt: new Date()
    });

    res.json({ id: dishRef.id, imageUrl, embeddingLength: embedding.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

export default router;

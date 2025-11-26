import express from "express";
import router from "express";
const r = express.Router();

// Mock AI free
r.post("/", (req, res) => {
  const { message } = req.body;
  res.json({ reply: `AI says: You asked "${message}". This is a free mock response.` });
});

export default r;

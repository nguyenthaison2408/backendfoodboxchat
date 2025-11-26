import express from "express";
import { db } from "../firebase.js";
const router = express.Router();

// GET /api/search-dish?q=pho
router.get("/", async (req, res) => {
  const { q } = req.query;

  try {
    const snapshot = await db.collection("dishes")
      .where("name", ">=", q)
      .where("name", "<=", q + "\uf8ff")
      .get();

    const dishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ dishes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ dishes: [] });
  }
});

export default router;

import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { calories, preference } = req.body;
  const mealPlan = [
    { name: "Salad", calories: 150 },
    { name: "Grilled Chicken", calories: 350 },
    { name: "Steamed Veggies", calories: 200 }
  ];
  res.json({ mealPlan });
});

export default router;

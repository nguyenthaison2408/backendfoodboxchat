import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chat.js";
import mealRoutes from "./routes/mealPlanner.js";
import searchRoutes from "./routes/searchDish.js";
import searchByImageRoutes from "./routes/searchByImage.js";
import uploadRoutes from "./routes/uploadImage.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use("/api/chat", chatRoutes);
app.use("/api/meal-planner", mealRoutes);
app.use("/api/search-dish", searchRoutes);
app.use("/api/search-by-image", searchByImageRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

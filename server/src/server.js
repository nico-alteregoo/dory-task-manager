import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { connectDB } from "./config/database.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: "ok"
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Listing to port ${PORT}`);
  connectDB();
});

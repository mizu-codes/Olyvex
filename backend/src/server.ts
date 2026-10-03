import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";

const app = express();

const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Olyvex API is running",
  });
});

app.use("/api/auth", authRouter);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

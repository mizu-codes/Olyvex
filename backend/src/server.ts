import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(
  cors({
    origin: "https://mizu-olyvex.vercel.app",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Olyvex API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);

await connectDB();

export default app;
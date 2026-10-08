import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://mizu-olyvex.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
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

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;

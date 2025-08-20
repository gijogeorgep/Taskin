import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import { connectDb } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import roleRouter from "./routes/role.route.js";
import proRouter from "./routes/project.route.js";
import ProjectPermissionRouter from "./routes/projectPermission.route.js";
import taskRoute from "./routes/task.route.js";
import categoryRouter from "./routes/category.route.js";
import CustomFieldRouter from "./routes/customField.route.js";
import { startReportCron } from "./cron/weeklySummaryCron.js";
import notificationRoute from "./routes/notification.route.js";
import profileImageRouter from "./routes/profileImage.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// === CORS ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://taskin-git-main-gijogeorgep02-6260s-projects.vercel.app",
  "https://taskin-rho.vercel.app",
  "https://taskin-ow1k.onrender.com",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// === Connect DB & Start Cron ===
connectDb();
startReportCron();

// === Middleware ===
app.use(express.json());
app.use(cookieParser());

// === API routes ===
app.use("/api/auth", authRouter);
app.use("/api/role", roleRouter);
app.use("/api/project", proRouter);
app.use("/api/projectPermission", ProjectPermissionRouter);
app.use("/api/taskCategories", categoryRouter);
app.use("/api/task", taskRoute);
app.use("/api/custom-field", CustomFieldRouter);
app.use("/api/notifications", notificationRoute);
app.use("/api/profileImage", profileImageRouter);

// === Serve React frontend ===
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/build")));

// Catch-all for React SPA routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// === Start server ===
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

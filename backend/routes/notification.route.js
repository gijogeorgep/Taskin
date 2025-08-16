import express from "express";
import { sendWeeklySummaryHandler } from "../controllers/notification.controller.js";
const notificationRoute = express.Router();

notificationRoute.get("/send-weekly-summary", sendWeeklySummaryHandler);
export default notificationRoute;

import cron from "node-cron";
import { sendWeeklySummaryToAllUsers } from "../controllers/notification.controller.js";

export const startReportCron = () => {
  cron.schedule("0 9 * * 1", async () => {
    console.log("Sending weekly summary email... ");
    await sendWeeklySummaryToAllUsers();
  });
};

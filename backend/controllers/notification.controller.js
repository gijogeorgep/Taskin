import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";

export const sendWeeklySummaryEmail = async (userId) => {
  try {

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log(" No user found for ID:", userId);
      return;
    }

    if (!user.notificationPreferences?.weeklyReports) {
      console.log(` Skipping ${user.email} - weeklyReports notification is false`);
      return;
    }

    const oneWeekAgo = new Date();

    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const projects = await Project.find({
      "members.user": userId,
      $or: [
        { createdAt: { $gte: oneWeekAgo } },
        { updatedAt: { $gte: oneWeekAgo } },
      ],
    });
    const tasks = await Task.find({
      assignedTo: userId,

      $or: [
        { createdAt: { $gte: oneWeekAgo } },
        { updatedAt: { $gte: oneWeekAgo } },
      ],
    })
      .populate("project", "title status")
      .populate("category", "name");

    if (projects.length === 0 && tasks.length === 0) {
      console.log(`Skipping ${user.email} - no projects or tasks`);
      return;
    }

    const groupedTasks = {
      pending: tasks.filter((t) => t.status === "todo"),
      inProgress: tasks.filter((t) => t.status === "inprogress"),
      done: tasks.filter((t) => t.status === "done"),
    };
    const reminder =
      groupedTasks.pending.length > 0 || groupedTasks.inProgress.length > 0
        ? "<p><b>Reminder: </b>Please complete your pending tasks within a few days. </p>"
        : "";

    const projectStatusSummary = {
      active: projects.filter((p) => p?.status === "active").length,
      completed: projects.filter((p) => p?.status === "completed").length,
    };

    const message = `
      <h2>Hello ${user.name},</h2>
      <p>Here is your weekly project and task summary:</p>
      <ul>
        <li><b>Active Projects:</b> ${projectStatusSummary.active}</li>
        <li><b>Completed Projects:</b> ${projectStatusSummary.completed}</li>
      </ul>
      <ul>
        <li><b>Pending Tasks:</b> ${groupedTasks.pending.length}</li>
        <li><b>In Progress:</b> ${groupedTasks.inProgress.length}</li>
        <li><b>Done:</b> ${groupedTasks.done.length}</li>
                <li> ${reminder}</li>

      </ul>
      <p>Have a great week ahead!</p>
    `;

    console.log(`Sending email to ${user.email}...`);
    const startDate = oneWeekAgo.toDateString();
    const endDate = new Date().toDateString();
    const subject = `Weekly Summary Report (${startDate} -${endDate})`;

    await sendEmail(user.email, subject, message);
    console.log(` Summary email sent to ${user.email}`);
  } catch (error) {
    console.error(" Error sending summary to", userId, ":", error.message);
  }
};

export const sendWeeklySummaryToAllUsers = async () => {
  try {
    const users = await User.find({
      "notificationPreferences.weeklyReports": true,
    });
    for (const user of users) {
      await sendWeeklySummaryEmail(user._id);
    }

    console.log("Weekly summaries sent to all users");
  } catch (error) {
    console.error(" Error sending summaries to all users:", error);
  }
};

export const sendWeeklySummaryHandler = async (req, res) => {
  try {
    await sendWeeklySummaryToAllUsers();
    return res.status(200).json({ message: "Weekly summaries sent" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send weekly summaries" });
  }
};

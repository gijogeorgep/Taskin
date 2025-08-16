import express from "express";
import {
  AddTask,
  deleteTask,
  updateTask,
  getTaskById,
  getTaskByProjectId,
  addComment,
  updateComment,
  deleteComment,
  getAllTask,
} from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";
import { checkProjectPermission } from "../middleware/checkProjectPermission.middleware.js";

const taskRoute = express.Router();

taskRoute.post(
  "/addtask",
  protectRoute,
  checkProjectPermission("create_task"),
  AddTask
);

taskRoute.get(
  "/getTaskById/:id",
  protectRoute,
  // checkProjectPermission("view_tasks"),
  getTaskById
);

taskRoute.delete(
  "/deletetask/:taskId",
  protectRoute,
  checkProjectPermission("delete_task"),
  deleteTask
);

taskRoute.put(
  "/updatetask/:id",
  protectRoute,
  // checkProjectPermission("edit_task"),
  updateTask
);

taskRoute.get(
  "/taskByProject/:projectId",
  protectRoute,
  checkProjectPermission("view_tasks"),
  getTaskByProjectId
);

taskRoute.get("/getalltask", protectRoute, getAllTask);

taskRoute.post("/:taskId/comment", protectRoute, addComment);

taskRoute.put("/:taskId/comment/:commentId", protectRoute, updateComment);

taskRoute.delete("/:taskId/comment/:commentId", protectRoute, deleteComment);
export default taskRoute;

// _id
// 685e24aa8a482b1be207ac48
// project
// 685e24aa8a482b1be207ac43
// user
// 685d13e8ad515d1b48bccf14

// permissions
// Array (4)
// 0
// "create_task"
// 1
// "edit_task"
// 2
// "delete_task"
// 3
// "view_tasks"
// __v
// 0
// createdAt
// 2025-06-27T04:57:14.257+00:00
// updatedAt
// 2025-06-27T04:57:14.257+00:00

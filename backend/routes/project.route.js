import express from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
  getProjectById,
  getUserProjects,
  getProjectTaskStatusSummary,
  updateProjectStatus,
} from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";
import { checkPermission } from "../middleware/checkPermition.middleware.js";

const proRouter = express.Router();

proRouter.post(
  "/createProject",
  protectRoute,
  checkPermission("create_project"),
  createProject
);
proRouter.put(
  "/updateProject/:id",
  protectRoute,
  checkPermission("edit_project"),
  updateProject
);
proRouter.delete(
  "/deleteProject/:id",
  protectRoute,
  checkPermission("delete_project"),
  deleteProject
);
proRouter.get(
  "/getAllProjects",
  protectRoute,
  checkPermission("view_projects"),
  getAllProjects
);

proRouter.get(
  "/getUserProjects/:userId",
  protectRoute,
  checkPermission("view_projects"),
  getUserProjects
);
proRouter.get(
  "/getProjectById/:id",
  protectRoute,
  checkPermission("view_projects"),
  getProjectById
);

proRouter.get(
  "/getProjectTaskStatusSummary",
  protectRoute,
  checkPermission("view_reports"),
  getProjectTaskStatusSummary
);

proRouter.get("/status/update/:projectId", updateProjectStatus);
export default proRouter;

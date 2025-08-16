import express from "express";
import {
  createProjectPermission,
  getProjectPermissions,
  updateProjectPermission,
  deleteProjectPermission,
} from "../controllers/ProjectPermision.controller.js";

import { protectRoute } from "../middleware/protctedRoute.middleware.js";
import { checkPermission } from "../middleware/checkPermition.middleware.js";

const ProjectPermissionRouter = express.Router();

ProjectPermissionRouter.post(
  "/createProjectPermission",
  protectRoute,
  checkPermission("create_project"),
  createProjectPermission
);

ProjectPermissionRouter.get(
  "/getProjectPermissions/:projectID",
  protectRoute,
  checkPermission("view_projects"),
  getProjectPermissions
);

ProjectPermissionRouter.put(
  "/updateProjectPermission/:permissionID",
  protectRoute,
  checkPermission("create_project"),
  updateProjectPermission
);

ProjectPermissionRouter.delete(
  "/deleteProjectPermission/:permissionID",
  protectRoute,
  checkPermission("create_project"),
  deleteProjectPermission
);

export default ProjectPermissionRouter;

import express from "express";
import {
  addRole,
  getRoles,
  deleteRole,
  updateRole,
} from "../controllers/role.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";
import { checkPermission } from "../middleware/checkPermition.middleware.js";

const roleRouter = express.Router();

roleRouter.post(
  "/addRole",
  protectRoute,
  checkPermission("assign_roles"),
  addRole
);
roleRouter.get(
  "/getRoles",
  protectRoute,
  checkPermission("assign_roles"),
  getRoles
);
roleRouter.delete(
  "/deleteRole/:roleId",
  protectRoute,
  checkPermission("assign_roles"),
  deleteRole
);
roleRouter.put(
  "/updateRole/:roleId",
  protectRoute,
  checkPermission("assign_roles"),
  updateRole
);

export default roleRouter;

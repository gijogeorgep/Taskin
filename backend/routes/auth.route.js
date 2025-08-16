import express from "express";
import {
  addUser,
  loginUser,
  logoutUser,
  checkAuth,
  editUser,
  deleteUser,
  getAllUsers,
  getUserById,
  resetPassword,
  forgotPassword,
  verifyResetToken,
  updateNotificationPreference,
  getAllUsersWithInactive,
  changePassword,
  // autoLogin,
  updateProfile,
  changePasswordSetting,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";
import { checkPermission } from "../middleware/checkPermition.middleware.js";

const authRouter = express.Router();

authRouter.post(
  "/addUser",
  protectRoute,
  checkPermission("create_user"),
  addUser
);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/checkAuth", protectRoute, checkAuth);

authRouter.put(
  "/editUser/:userId",
  protectRoute,

  editUser
);
authRouter.delete(
  "/deleteUser/:userId",
  protectRoute,
  checkPermission("delete_user"),
  deleteUser
);
authRouter.get(
  "/getAllUsers",
  protectRoute,
  checkPermission("view_all"),
  getAllUsers
);

authRouter.get(
  "/getAllUsersWithInactive",
  protectRoute,
  checkPermission("view_all"),
  getAllUsersWithInactive
);
authRouter.get(
  "/getUserById/:userId",
  protectRoute,
  checkPermission("view_all"),
  getUserById
);

authRouter.put("/profile", protectRoute, updateProfile);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.put("/change-password", protectRoute, changePasswordSetting);
authRouter.get("/verify-reset-token/:token", verifyResetToken);
authRouter.put(
  "/notification-preferences",
  protectRoute,
  updateNotificationPreference
);

// authRouter.post("/invite-login", autoLogin);
authRouter.post("/change-password", changePassword);

export default authRouter;

import express from "express";
import uploadImage from "../middleware/multer.js";
import {
  uploadProfileImage,
  deleteProfileImage,
  getUserDetails,
  updateProfile,
} from "../controllers/profileImage.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";

const profileImageRouter = express.Router();

profileImageRouter.post(
  "/uploadProfileImage",
  protectRoute,
  uploadImage,
  uploadProfileImage
);
profileImageRouter.delete(
  "/deleteProfileImage",
  protectRoute,
  deleteProfileImage
);

profileImageRouter.put(
  "/updateProfile",
  protectRoute,
  uploadImage,
  updateProfile
);

profileImageRouter.get("/getUserDetails", protectRoute, getUserDetails);

export default profileImageRouter;

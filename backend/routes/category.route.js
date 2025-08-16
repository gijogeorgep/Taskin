import express from "express";
import {
  createCategory,
  getAllCategories,
  addTaskToCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { protectRoute } from "../middleware/protctedRoute.middleware.js";

const categoryRouter = express.Router();

categoryRouter.post("/createCategory", protectRoute, createCategory);

categoryRouter.get("/getAllCategories", protectRoute, getAllCategories);

categoryRouter.post(
  "/addTaskToCategory/:categoryId/tasks",
  protectRoute,
  addTaskToCategory
);

categoryRouter.delete(
  "/deleteCategory/:categoryId",
  protectRoute,
  deleteCategory
);

categoryRouter.put("/updateCategory/:categoryId", protectRoute, updateCategory);

export default categoryRouter;

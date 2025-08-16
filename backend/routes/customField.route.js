import express from "express";
import {
  createCustomField,
  getCustomFields,
  updateCustomField,
  deleteCustomField,
} from "../controllers/customField.controller.js";

const CustomFieldRouter = express.Router();
CustomFieldRouter.post("/create", createCustomField);
CustomFieldRouter.get("/getAllFields", getCustomFields);
CustomFieldRouter.put("/:id", updateCustomField);
CustomFieldRouter.delete("/:id", deleteCustomField);
export default CustomFieldRouter;

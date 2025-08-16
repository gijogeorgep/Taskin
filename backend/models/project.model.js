import mongoose from "mongoose";
import Task from "../models/task.model.js";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      },
    ],
    status: {
      type: String,
      enum: [
        "planned",
        "in progress",
        "completed",
        "on hold",
        "due",
        "cancelled",
      ],
      default: "planned",
    },
    Budget: {
      type: Number,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: Date,

    customFieldData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;

import React, { useEffect, useRef, useState } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { useProjectStore } from "../store/useProjectStore";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useCategoryStore } from "../store/useCategoryStore";
import { useTaskStore } from "../store/useTaskStore";

function AddTask({ isOpen, onClose, selectedCategory }) {
  const { projectId } = useParams();
  const { getProjectById } = useProjectStore();
  const { getAllUsers } = useAuthStore();
  const { addTaskToCategory } = useCategoryStore();
  const { fetchCategories, categories } = useCategoryStore();
  const { getTaskByProject } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [projectEndDate, setProjectEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    category: selectedCategory || null,
  });

  const inputRef = useRef();
  const handleOpenDate = () => {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const project = await getProjectById(projectId);
      await getAllUsers();
      if (project?.members) setMembers(project.members);
      if (project?.endDate) {
        setProjectEndDate(project.endDate.split("T")[0]);
      }
      if (project?.startDate) {
        setStartDate(project.startDate.split("T")[0]);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen, projectId]);

  useEffect(() => {
    if (isOpen) {
      const defaultCat = categories.find((cat) => cat.name === "Default Tasks");
      setForm((prev) => ({
        ...prev,
        project: projectId,
        category: selectedCategory ? selectedCategory : defaultCat?._id,
      }));
    }
    console.log("Selected category:", selectedCategory);
    console.log("Form data:", form);
  }, [isOpen, selectedCategory, projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!projectId) return alert("Missing Project ID");
    console.log("Submitting Task with Category:", form.category);
    if (new Date(form.dueDate) > new Date(projectEndDate)) {
      alert("Task due date cannot be after the project end date.");
      setIsLoading(false);
      return;
    }

    await addTaskToCategory(form.category || null, {
      ...form,
      project: projectId,
    });

    await fetchCategories(projectId);
    await getTaskByProject(projectId);

    setForm({
      title: "",
      description: "",
      assignedTo: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      category: selectedCategory || null,
    });

    onClose();
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-gray-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-center">Create Task</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Task title"
            className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Task description"
            className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 focus:outline-none"
          >
            <option value="">Assign to</option>
            {members
              .filter((m) => {
                const roleName = m?.role?.name?.toLowerCase();
                console.log("Role Name:", roleName);

                return roleName !== "client";
              })
              .map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.name}
                </option>
              ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg px-3 py-2 bg-gray-800 border border-gray-700"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="rounded-lg px-3 py-2 bg-gray-800 border border-gray-700"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <input
            ref={inputRef}
            onClick={handleOpenDate}
            type="date"
            name="dueDate"
            value={form.dueDate}
            min={startDate}
            max={projectEndDate}
            onChange={handleChange}
            className="w-full rounded-lg px-3 py-2  bg-gray-800 border border-gray-700"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 mt-2 rounded-lg font-semibold transition ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTask;

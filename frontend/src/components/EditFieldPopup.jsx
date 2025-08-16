import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCustomField } from "../store/useCustomFieldStore";
import { useProjectStore } from "../store/useProjectStore";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

function EditFieldPopup({ isOpen, onClose, editMode, fieldData }) {
  const [form, setForm] = useState({
    fieldName: "",
    fieldType: "text",
    appliesTo: "task",
    target: "",
    options: [],
  });

  const { fetchProjects } = useProjectStore();
  const { getAllTasks } = useTaskStore();

  const { getAllUsers, fetchAuthUser } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      await getAllUsers();
    };
    fetchUsers();
    fetchProjects();
    getAllTasks();

    fetchAuthUser();
  }, []);
  const [newOption, setNewOption] = useState("");

  const addField = useCustomField((state) => state.addField);
  const updateField = useCustomField((state) => state.updateField);

  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const allUsers = useAuthStore((state) => state.allUsers);

  useEffect(() => {
    if (editMode && fieldData) {
      setForm({
        fieldName: fieldData.fieldName || "",
        fieldType: fieldData.fieldType || "text",
        appliesTo: fieldData.appliesTo || "task",
        target: fieldData.target || "",
        options: fieldData.options || [],
      });
    }
  }, [editMode, fieldData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setForm((prev) => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateField(fieldData._id, form);
    } else {
      await addField(form);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-full max-w-xl relative">
        <button
          className="absolute top-3 right-3 text-gray-400"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Field</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h1 className="font-bold text-2xl ">{form.fieldName}</h1>
          </div>

          <div>
            <label className="block text-sm mb-1">Field Type</label>
            <select
              name="fieldType"
              value={form.fieldType}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="boolean">Boolean</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Applies To</label>
            <select
              name="appliesTo"
              value={form.appliesTo}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="tasks">Task</option>
              <option value="projects">Project</option>
              <option value="users">User</option>
            </select>
          </div>

          {(form.appliesTo === "projects" ||
            form.appliesTo === "tasks" ||
            form.appliesTo === "users") && (
            <div>
              <label className="block text-sm mb-1">Target</label>
              <select
                name="target"
                value={form.target}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
              >
                <option value="">Select {form.appliesTo}</option>
                {form.appliesTo === "projects" &&
                  projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                {form.appliesTo === "tasks" &&
                  tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}{" "}
                      {task.project?.title && ` - ${task.project.title}`}
                    </option>
                  ))}
                {form.appliesTo === "users" &&
                  allUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {form.fieldType === "dropdown" && (
            <div>
              <label className="block text-sm mb-2">Dropdown Options</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="New option"
                  className="flex-1 p-2 rounded bg-gray-800 border border-gray-700"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-gray-950 px-4 py-2 rounded text-white"
                >
                  Add
                </button>
              </div>

              <ul className="space-y-1">
                {form.options.map((opt, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="bg-gray-950 hover:bg-gray-800 px-4 py-2 rounded text-white w-full"
          >
            {editMode ? "Update Field" : "Create Field"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditFieldPopup;

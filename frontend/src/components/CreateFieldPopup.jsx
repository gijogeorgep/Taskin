import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useProjectStore } from "../store/useProjectStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCustomField } from "../store/useCustomFieldStore";
import { useTaskStore } from "../store/useTaskStore";
function CreateFieldPopup({ closeField }) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [appliesTo, setAppliesTo] = useState("");
  const [targetValue, setTargetValue] = useState("");

  const { fetchProjects, projects } = useProjectStore();

  const { allUsers, getAllUsers, fetchAuthUser } = useAuthStore();



  const { createField, loading } = useCustomField();
  const { getAllTasks, tasks } = useTaskStore();
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [optionInput, setOptionInput] = useState("");

  // const fetchFields = useCustomField((state) => state.fetchFields);

  useEffect(() => {
    const fetchUsers = async () => {
      await getAllUsers();
    };
    fetchUsers();
    fetchProjects();
    getAllTasks();

    fetchAuthUser();


  }, []);

  const fieldTypes = ["text", "number", "date", "boolean", "dropdown"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fieldName || !fieldType || !appliesTo) return;

    const data = {
      fieldName,
      fieldType,
      appliesTo,
      target: targetValue || null,
      options: fieldType === "dropdown" ? dropdownOptions : [],
    };

    await createField(data);


    if (appliesTo === "users") {
      await fetchAuthUser();
    }

 

    closeField();
  };

  const handleAddOption = () => {
    if (optionInput.trim() && !dropdownOptions.includes(optionInput.trim())) {
      setDropdownOptions([...dropdownOptions, optionInput.trim()]);
      setOptionInput("");
    }
  };

  const handleRemoveOption = (index) => {
    const updated = [...dropdownOptions];
    updated.splice(index, 1);
    setDropdownOptions(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-gray-950 text-white p-6 rounded-2xl shadow-lg space-y-4">
        <button
          onClick={closeField}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-center">Create Field</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="title"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            required
            placeholder="Field title"
            className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <select
            name="fieldType"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            required
            className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700 focus:outline-none"
          >
            <option value="">Select field type</option>
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {fieldType === "dropdown" && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Add dropdown option"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-2 bg-gray-900 rounded hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-gray-300">
                {dropdownOptions.map((option, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    {option}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <select
            name="appliesTo"
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
            className="rounded-lg px-3 py-2 w-full bg-gray-800 border border-gray-700"
          >
            <option value="">Select Applies To</option>
            <option value="users">Users</option>
            <option value="projects">Projects</option>
            <option value="tasks">Tasks</option>
          </select>

          {appliesTo === "projects" && (
            <select
              name="projects"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="rounded-lg px-3 py-2 w-full bg-gray-800 border border-gray-700"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          )}

          {appliesTo === "users" && (
            <select
              name="users"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="rounded-lg px-3 py-2 w-full bg-gray-800 border border-gray-700"
            >
              <option value="">Select a user</option>
              {allUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          {appliesTo === "tasks" && (
            <select
              name="tasks"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="rounded-lg px-3 py-2 w-full bg-gray-800 border border-gray-700"
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                  {task.project?.title && ` - ${task.project.title}`}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 mt-2 rounded-lg font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            {loading ? "Adding..." : "Add Field"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateFieldPopup;

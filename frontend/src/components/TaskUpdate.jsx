import React, { useEffect, useRef, useState } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";
import { useProjectStore } from "../store/useProjectStore";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";

function TaskUpdate({ isOpen, onClose, task }) {
  const { updateTask, getTaskWithField } = useTaskStore();
  const { projectId } = useParams();
  const { getProjectById } = useProjectStore();
  const { getAllUsers } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    category: "General",
  });

  const [customFields, setCustomFields] = useState([]);
  const [customFieldData, setCustomFieldData] = useState({});

  const { updateProjectStatus } = useProjectStore();
  useEffect(() => {
    const fetchTaskCustomFields = async () => {
      if (!task?._id) return;

      try {
        const res = await getTaskWithField(task._id);
        console.log(res, "res from getTaskWithField");

        if (res?.customFields) {
          setCustomFields(res.customFields);
        }

        if (res?.customFieldData) {
          setCustomFieldData(res.customFieldData);
        }
      } catch (error) {
        console.error("Failed to fetch task custom fields", error);
      }
    };

    if (isOpen && task?._id) {
      fetchTaskCustomFields();
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (task) {
      let formattedDueDate = "";
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        if (!isNaN(date)) {
          formattedDueDate = date.toISOString().split("T")[0];
        }
      }

      setForm({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assignedTo?._id || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: formattedDueDate,
        category: task.category || "General",
      });

      setCustomFieldData(task.customFieldData || {});
    }
  }, [task]);

  useEffect(() => {
    const fetchData = async () => {
      const project = await getProjectById(projectId);
      await getAllUsers();
      if (project?.members) setMembers(project.members);

      if (project?.startDate) {
        setProjectStartDate(project.startDate.split("T")[0]);
      }
      if (project?.endDate) {
        setProjectEndDate(project.endDate.split("T")[0]);
      }
    };

    if (isOpen) fetchData();
  }, [isOpen, projectId, getProjectById, getAllUsers]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFieldData((prev) => {
      const updated = {
        ...prev,
        [fieldName]: value,
      };
      console.log(`Updated customFieldData:`, updated);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!projectId || !task?._id) return alert("Missing Project ID or Task ID");

    const { title, description, assignedTo, category, dueDate } = form;
    if (!title || !description || !assignedTo || !category || !dueDate) {
      return alert("All fields are required");
    }

    console.log("Submitting customFieldData:", customFieldData);
    console.log("Full form data:", {
      ...form,
      customFieldData,
      project: projectId,
    });
    await updateTask(task._id, {
      ...form,
      customFieldData,
      project: projectId,
    });

    setForm({
      title: "",
      description: "",
      assignedTo: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      category: "General",
    });
    await updateProjectStatus(projectId);

    setLoading(false);
    // console.log(form, "form data from task update");

    onClose();
  };

  const inputRef = useRef();

  const handleOpenDate = () => {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
    }
  };

  // console.log("Final rendered customFields:", customFields);
  // console.log("Final rendered customFieldData:", customFieldData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg bg-gray-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-center">Update Task</h2>
        <form
          onSubmit={handleSubmit}
          className={`grid grid-cols-1    ${
            customFields.length > 0 ? "md:grid-cols-2 gap-6" : "grid-cols-1"
          }  `}
        >
          <div className="space-y-3">
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

            <div
              className={` grid  gap-3 ${
                customFields.length > 0 ? "grid-cols-2" : "grid-cols-1"
              } `}
            >
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="rounded-lg px-3 py-2 bg-gray-800 border border-gray-700"
              >
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
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
              type="date"
              name="dueDate"
              value={form.dueDate}
              ref={inputRef}
              onClick={handleOpenDate}
              min={projectStartDate}
              max={projectEndDate}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 bg-gray-800 border border-gray-700"
              required
            />
          </div>

          <div className="space-y-3">
            {customFields.length > 0 && (
              <div>
                <div className="grid grid-cols-1 gap-4">
                  {customFields.map((field) => (
                    <div key={field._id}>
                      <label className="block mb-1 text-sm font-medium text-gray-400">
                        {field.fieldName}
                      </label>

                      {field.fieldType === "boolean" ? (
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-6 flex items-center bg-gray-600 rounded-full p-1 cursor-pointer transition duration-300 ${
                              customFieldData[field.fieldName] === "Yes"
                                ? "bg-white"
                                : "bg-gray-950"
                            }`}
                            onClick={() =>
                              handleCustomFieldChange(
                                field.fieldName,
                                customFieldData[field.fieldName] === "Yes"
                                  ? "No"
                                  : "Yes"
                              )
                            }
                          >
                            <div
                              className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                customFieldData[field.fieldName] === "Yes"
                                  ? "translate-x-6 bg-black"
                                  : "translate-x-0 bg-white "
                              }`}
                            ></div>
                          </div>
                          <span className="text-white">
                            {customFieldData[field.fieldName] === "Yes"
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                      ) : field.fieldType === "date" ? (
                        <input
                          type="date"
                          value={customFieldData[field.fieldName] || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              field.fieldName,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
                        />
                      ) : field.fieldType === "dropdown" ? (
                        <select
                          value={customFieldData[field.fieldName] || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              field.fieldName,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType}
                          value={customFieldData[field.fieldName] || ""}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              field.fieldName,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-700 rounded bg-gray-900 text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 mt-2 transition rounded-lg font-semibold  ${
                loading
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : " bg-white text-black hover:bg-gray-200 "
              }`}
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskUpdate;

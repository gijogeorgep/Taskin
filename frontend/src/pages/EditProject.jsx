import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "../store/useProjectStore";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, ChevronDown, ChevronUp, X } from "lucide-react";

const ProjectMemberPermissions = ({
  allUsers,
  selectedMembers,
  setSelectedMembers,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleMemberToggle = (userId) => {
    const exists = selectedMembers.find((m) => m.user === userId);
    if (exists) {
      setSelectedMembers((prev) => prev.filter((m) => m.user !== userId));
    } else {
      const user = allUsers.find((u) => u._id === userId);
      if (!user?.globalRole?._id) {
        alert("This user has no global role assigned.");
        return;
      }
      const defaultPermissions = user?.globalRole?.permissions || [];
      setSelectedMembers((prev) => [
        ...prev,
        {
          user: userId,
          role: user.globalRole._id,
          permissions: [...defaultPermissions],
        },
      ]);
    }
  };

  const handlePermissionChange = (index, permission) => {
    const updated = [...selectedMembers];
    const currentPermissions = updated[index].permissions;
    updated[index].permissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];
    setSelectedMembers(updated);
  };

  return (
    <div className="border border-gray-300 rounded-xl p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-xl font-semibold text-gray-800">
          Project Members & Permissions
        </h2>
        {expanded ? (
          <ChevronUp className="text-gray-500" />
        ) : (
          <ChevronDown className="text-gray-500" />
        )}
      </div>

      {expanded && (
        <div className="mt-5">
          {/* User Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto mb-6 p-2 bg-white rounded-lg shadow-inner">
            {allUsers
              ?.filter((user) => user.status === "active")
              .map((user) => (
                <div
                  key={user._id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer text-sm flex justify-between items-center ${
                    selectedMembers.some((m) => m.user === user._id)
                      ? "bg-blue-100 border-blue-300 text-gray-800"
                      : "bg-gray-50 border-gray-300 hover:bg-blue-50"
                  }`}
                  onClick={() => handleMemberToggle(user._id)}
                >
                  <span>
                    {user.name}{" "}
                    <span className="text-gray-500 text-xs">
                      ({user.globalRole?.name})
                    </span>
                  </span>
                </div>
              ))}
          </div>

          {/* Permissions Editor */}
          {selectedMembers.length > 0 && (
            <div className="mt-6 space-y-5">
              {selectedMembers.map((member, idx) => {
                const user = allUsers.find((u) => u._id === member.user);
                return (
                  <div
                    key={member.user}
                    className="border border-gray-300 p-5 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-800 font-semibold text-base">
                        {user?.name}{" "}
                        <span className="text-sm text-gray-500">
                          ({user?.globalRole?.name})
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "create_task",
                        "edit_task",
                        "delete_task",
                        "view_tasks",
                        "comment",
                      ].map((perm) => (
                        <button
                          key={perm}
                          type="button"
                          className={`text-sm px-4 py-2 rounded-full border transition-all ${
                            member.permissions?.includes(perm)
                              ? "bg-blue-100 border-blue-300 text-blue-800 font-medium"
                              : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-blue-50"
                          }`}
                          onClick={() => handlePermissionChange(idx, perm)}
                        >
                          {perm.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProjectById, editProject, isLoading } = useProjectStore();
  const { getAllUsers, allUsers } = useAuthStore();

  const [formData, setFormData] = useState({
    title: "",
    status: "",
    members: [],
    description: "",
    Budget: "",
    startDate: "",
    endDate: "",
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldData, setCustomFieldData] = useState({});
  const [createdByName, setCreatedByName] = useState("Unknown");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProjectById(projectId);
      await getAllUsers();

      if (data) {
        setFormData({
          title: data.title || "",
          status: data.status || "",
          members: data.members || [],
          description: data.description || "",
          Budget: data.Budget || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
        });

        // Map projectPermissions to selectedMembers
        const membersWithPermissions = data.members.map((m) => {
          const perm = data.projectPermissions.find(
            (p) => String(p.user._id || p.user) === String(m.user._id || m.user)
          );
          return {
            user: m.user._id || m.user,
            role: m.role?._id || m.role,
            permissions: perm?.permissions || [], // ONLY project-level perms
          };
        });

        setSelectedMembers(membersWithPermissions);
        setCustomFields(data.customField || []);
        setCustomFieldData(data.customFieldData || {});
        setCreatedByName(data.createdBy?.name || "Unknown");
      }
    };
    fetchData();
  }, [projectId, getProjectById, getAllUsers]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCustomFieldChange = (fieldName, value) =>
    setCustomFieldData((prev) => ({ ...prev, [fieldName]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      customFieldData,
      members: selectedMembers.map((m) => ({
        user: m.user,
        role: m.role,
        permissions: m.permissions,
      })),
    };
    await editProject(projectId, projectData);
    navigate(`/projects/${projectId}`);
  };

  const prevStartDateRef = useRef("");
  const prevEndDateRef = useRef("");
  useEffect(() => {
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      alert("Start date cannot be later than end date.");
      setFormData((prev) => ({
        ...prev,
        startDate: prevStartDateRef.current,
        endDate: prevEndDateRef.current,
      }));
    } else {
      prevStartDateRef.current = formData.startDate;
      prevEndDateRef.current = formData.endDate;
    }
  }, [formData.startDate, formData.endDate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col px-4 lg:pl-[18%]">
      {/* Sticky Header */}
      <div className="sticky top-0 px-10 py-4 flex items-center gap-4 bg-white shadow-sm z-10">
        <Link to={`/projects/${projectId}`}>
          <ArrowLeft className="text-gray-600 hover:text-blue-600 transition" />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-800">Edit Project</h2>
      </div>

      <div className="w-full lg:max-w-[80%] mx-auto py-8">
        <p className="text-gray-600 mb-6">
          <span className="font-medium text-gray-800">Created By:</span>{" "}
          {createdByName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-300 p-6 rounded-xl bg-white shadow-sm">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Project Title"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Status</option>
                <option value="planned">Planned</option>
                <option value="in progress">In Progress</option>
                <option value="on hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Project Description"
                rows="4"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Budget</label>
              <input
                type="number"
                name="Budget"
                value={formData.Budget}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Budget"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Permissions Section */}
          <ProjectMemberPermissions
            allUsers={allUsers}
            selectedMembers={selectedMembers}
            setSelectedMembers={setSelectedMembers}
          />

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="border border-gray-300 p-6 rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-5 text-gray-800">Custom Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {customFields.map((field) => (
                  <div key={field._id}>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      {field.fieldName}
                    </label>

                    {field.fieldType === "boolean" ? (
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${
                            customFieldData[field.fieldName] === "Yes"
                              ? "bg-green-400"
                              : "bg-red-400"
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
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                              customFieldData[field.fieldName] === "Yes"
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                        <span className="text-gray-800">
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
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    ) : field.fieldType === "dropdown" &&
                      Array.isArray(field.options) ? (
                      <select
                        value={customFieldData[field.fieldName] || ""}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            field.fieldName,
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="">Select an option</option>
                        {field.options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
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
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all ${
              isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProject; 
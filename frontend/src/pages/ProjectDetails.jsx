import {
  Plus,
  SquarePen,
  ArrowLeft,
  Users,
  Trash,
  Calendar,
  DollarSign,
  User,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import { useEffect, useState } from "react";
import InitialsAvatar from "react-initials-avatar";
import TaskCard from "../components/TaskCard";
import { useTaskStore } from "../store/useTaskStore";
import { useCategoryStore } from "../store/useCategoryStore";

const SkeletonBox = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div
    className={`bg-gray-200 animate-pulse rounded-lg ${width} ${height} ${className}`}
  ></div>
);

const SkeletonHeader = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 ">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
      <div className="flex items-start gap-4 flex-1">
        <SkeletonBox width="w-8" height="h-8" className="hidden sm:block mt-1" />
        <div className="space-y-3 flex-1">
          <SkeletonBox width="w-2/3" height="h-10" />
          <SkeletonBox width="w-full" height="h-5" />
          <SkeletonBox width="w-3/4" height="h-5" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <SkeletonBox width="w-36" height="h-12" className="rounded-xl" />
        <SkeletonBox width="w-40" height="h-12" className="rounded-xl" />
      </div>
    </div>
  </div>
);

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { getProjectById, deleteProject } = useProjectStore();
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { getTaskByProject } = useTaskStore();
  const { createCategory } = useCategoryStore();
  const [form, setForm] = useState({ category: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.category, project: projectId };
      await createCategory(payload, projectId);
      setIsModalOpen(false);
      setForm({ category: "" });
    } catch (err) {
      console.error("Error creating category:", err.response?.data || err.message);
    }
  };

  const date = new Date(project.endDate);
  const formattedDate = isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US");

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "planned":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "on hold":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "due":
        return "bg-red-50 text-red-700 border-red-200";
      case "cancelled":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const deleteProjectHandler = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (!confirmed) return;
    try {
      await deleteProject(projectId);
      navigate("/projects");
    } catch (error) {
      console.log("Error deleting project:", error);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(projectId);
        if (data) {
          setProject(data);
          setMembers(data.members || []);
          await getTaskByProject(projectId);
        } else {
          navigate("/projects");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100  dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40] p-4 sm:p-6">
      <div className="px-6 md:pl-[20%] py-8">
        {/* Header */}
        {loading ? (
          <SkeletonHeader />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 dark:bg-[#1e1f23] dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Link 
                  to="/projects"
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 hidden sm:flex items-center justify-center dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight dark:text-gray-100">
                      {toTitleCase(project?.title) || "Project title unavailable"}
                    </h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(project?.status)}`}>
                      {project?.status
                        ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                    {toTitleCase(project?.description) || "No description available."}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/editProject/${projectId}`}>
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 px-6 py-3 rounded-xl text-gray-700 flex items-center gap-2 font-medium transition-all duration-200 shadow-sm dark:bg-[#2c2d31] dark:border-gray-600 dark:hover:bg-[#3a3b40] dark:text-gray-100">
                    <SquarePen className="w-4 h-4" />
                    Edit Project
                  </button>
                </Link>
                <button
  onClick={() => setIsModalOpen(true)}
  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
             dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800
             text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium 
             transition-all duration-200 shadow-sm"
>
  <Plus className="w-4 h-4" />
  Add Task List
</button>

              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="xl:w-96 space-y-6">
            {/* Project Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-[#1e1f23] dark:border-gray-700  ">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl dark:bg-blue-900/40">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Overview</h2>
              </div>
              
              <div className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Project Owner</p>
                      <p className="text-sm font-semibold text-gray-900">{project?.createdBy?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Budget</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {project.Budget?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Custom Fields integrated within Project Overview */}
                  {project.customField && project.customField.length > 0 && (
                    <>
                      {project.customField.map((field) => (
                        <div key={field._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Settings className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {field.fieldName}
                            </p>
                            {field.value ? (
                              <p className="text-sm font-semibold text-gray-900">
                                {field.value}
                              </p>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-400 italic">No value set</p>
                                <button
                                  onClick={() => navigate(`/editProject/${projectId}`)}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-md transition-colors duration-200"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 dark:bg-[#1e1f23] dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-xl dark:bg-indigo-900/40">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Members</h2>
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                  {members?.length || 0}
                </span>
              </div>
              
              {members?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-gray-700">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium ">No team members yet</p>
                  <p className="text-gray-400 text-sm">Add members to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200 dark:hover:bg-gray-700">
                      {member.user?.profilePic ? (
                        <img
                          src={member.user.profilePic}
                          alt={member.user.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <InitialsAvatar
                          name={toTitleCase(member.user?.name) || "User"}
                          className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-11 h-11 flex items-center justify-center font-semibold"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {toTitleCase(member.user?.name) || "Unknown Member"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300" >
                          {toTitleCase(member.role?.name) || "No role assigned"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete this project, there is no going back. Please be certain.
              </p>
              <button
                onClick={deleteProjectHandler}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <Trash className="w-4 h-4" />
                Delete Project
              </button>
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="flex-1">
            <TaskCard
              isOpen={isTaskOpen}
              setTaskOpen={setIsTaskOpen}
              getTaskByProject={getTaskByProject}
              projectId={projectId}
              refreshProject={async () => {
                const updated = await getProjectById(projectId);
                setProject(updated);
              }}
            />
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Create New Task List
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      List Name
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      placeholder="Enter list name..."
                      className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200"
                    >
                      Create List
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
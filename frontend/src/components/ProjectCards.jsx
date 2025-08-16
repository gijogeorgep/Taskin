import { Link } from "react-router-dom";
import { Calendar, Users } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 px-3 py-1 text-center rounded-full border border-emerald-200 shadow-sm";
    case "in progress":
      return "bg-gradient-to-r from-blue-50 to-sky-100 text-blue-700 px-3 py-1 text-center rounded-full border border-blue-200 shadow-sm";
    case "planned":
      return "bg-gradient-to-r from-yellow-50 to-amber-100 text-yellow-700 px-3 py-1 text-center rounded-full border border-yellow-200 shadow-sm";
    case "on hold":
      return "bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 px-3 py-1 text-center rounded-full border border-orange-200 shadow-sm";
    case "due":
      return "bg-gradient-to-r from-red-50 to-rose-100 text-red-700 px-3 py-1 text-center rounded-full border border-red-200 shadow-sm";
    case "cancelled":
      return "bg-gradient-to-r from-purple-50 to-violet-100 text-purple-700 px-3 py-1 text-center rounded-full border border-purple-200 shadow-sm";
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-700 px-3 py-1 text-center rounded-full border border-gray-200 shadow-sm";
  }
};

const toTitleCase = (str) =>
  str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export default function ProjectCard({ project }) {
  const date = new Date(project.endDate);
  const formattedDate = date.toLocaleDateString("en-US");
  const completedTasks = project.tasks?.filter((task) => task.status === "done");
  const totalTasks = project.tasks?.length || 0;
  const progressPercentage = project.progress || 0;

  return (
    <Link to={`/projects/${project._id}`} className="block group">
      <div className="rounded-xl border border-white/50 p-6 
                     bg-white/70 backdrop-blur-md shadow-lg
                     hover:shadow-xl hover:scale-[1.02] hover:bg-white/80
                     transition-all duration-300 ease-out cursor-pointer h-full
                     group-hover:border-blue-200/60">
        
        {/* Header */}
        <div className="pb-4 mb-4 border-b border-gray-100/50">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 leading-tight
                          bg-gradient-to-r from-gray-800 to-gray-600 
                          bg-clip-text group-hover:from-blue-800 group-hover:to-indigo-600
                          transition-all duration-300">
              {toTitleCase(project.title)}
            </h2>
          </div>
          <div className="flex justify-start">
            <span className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Body */}
        <section className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {toTitleCase(project.description)}
          </p>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-gray-800 bg-gray-100/50 px-2 py-1 rounded-md">
                {progressPercentage}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 
                           rounded-full transition-all duration-500 ease-out
                           shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Dates & Team */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <div className="flex items-center text-blue-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Due Date</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{formattedDate}</p>
            </div>
            <div className="space-y-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
              <div className="flex items-center text-indigo-600">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Team Size</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">
                {project.members.length} members
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 mt-4 
                         border-t border-gray-100/50">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Tasks</span>
              <span className="text-sm font-medium text-gray-700">
                {completedTasks?.length || 0}/{totalTasks || 0} completed
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1">Budget</span>
              <span className="font-bold text-emerald-700 bg-emerald-50/50 
                             px-3 py-1 rounded-md border border-emerald-200/50">
                {project.Budget?.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </section>
      </div>
    </Link>
  );
}
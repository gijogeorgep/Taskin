import { X } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { useEffect, useState } from "react";

const TaskFullDetails = ({ task, closeDetails }) => {
  const { getTaskWithField } = useTaskStore();
  const [detailedTask, setDetailedTask] = useState(null);

  useEffect(() => {
    if (task?._id) {
      const fetchDetailedTask = async () => {
        try {
          const updated = await getTaskWithField(task._id);
          setDetailedTask(updated);
        } catch (err) {
          console.error("Failed to fetch task with fields", err);
        }
      };
      fetchDetailedTask();
    }
  }, [task?._id]);

  if (!detailedTask) return null;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const toTitleCase = (str) =>
    str?.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="inset-0 z-50flex items-center justify-center">
      <div className="relative w-full bg-white text-gray-900 p-8 shadow-2xl border border-gray-300 space-y-6 rounded-xl max-w-3xl rounded-lg">
        <button
          onClick={closeDetails}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6 tracking-wide">
          Details: {toTitleCase(detailedTask.title)}
        </h2>

        <div className="space-y-3">
          <div>
            <h2 className="text-gray-500 mb-1">Title</h2>
            <h2 className="text-xl font-semibold">{toTitleCase(detailedTask.title)}</h2>
          </div>
          <hr className="border-gray-200" />

          <div>
            <h2 className="text-gray-500 mb-1">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {toTitleCase(detailedTask.description)}
            </p>
          </div>
          <hr className="border-gray-200" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-gray-500 mb-1">Assigned To</h2>
              <p>{toTitleCase(detailedTask.assignedTo?.name) || "Unassigned"}</p>
            </div>

            <div>
              <h2 className="text-gray-500 mb-1">Priority</h2>
              <span
                className={`capitalize inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPriorityStyle(
                  detailedTask.priority
                )}`}
              >
                {detailedTask.priority}
              </span>
            </div>
          </div>
          <hr className="border-gray-200" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-gray-500 mb-1">Status</h2>
              <p className="capitalize">{detailedTask.status}</p>
            </div>
            <div>
              <h2 className="text-gray-500 mb-1">Due Date</h2>
              <p>
                {detailedTask.dueDate
                  ? new Date(detailedTask.dueDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="grid grid-cols-2 gap-6">
            {detailedTask.customFields?.map((field) => (
              <div key={field._id} className="text-gray-700 text-sm">
                {field.value ? (
                  <p>
                    <span className="text-gray-500">{field.fieldName}:</span>{" "}
                    {field.fieldType === "date"
                      ? new Date(
                          detailedTask.customFieldData?.[field.fieldName]
                        ).toLocaleDateString()
                      : detailedTask.customFieldData?.[field.fieldName]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Comments</h3>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {detailedTask.comments?.length || 0} {(detailedTask.comments?.length || 0) === 1 ? 'comment' : 'comments'}
              </div>
            </div>

            {detailedTask.comments && detailedTask.comments.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {detailedTask.comments.map((comment, ) => (
                  <div
                    key={comment._id}
                    className="group relative bg-gray-50/80 backdrop-blur-sm border border-gray-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-white/90 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {(comment.createdBy?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 leading-relaxed break-words mb-2">
                          {comment.text}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {comment.createdBy?.name || "Unknown user"}
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                         
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No comments yet</p>
                <p className="text-sm text-gray-400 mt-1">Comments will appear here once added</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFullDetails;

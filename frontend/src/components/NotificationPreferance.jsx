import { useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";

const NotificationPreference = () => {
  const { preferences, fetchPreferences, updatePreference } =
    useNotificationStore();

  useEffect(() => {
    fetchPreferences();
  }, []);

  return (
    <div className="flex flex-col gap-5 bg-white p-5 sm:p-7 rounded-md w-full sm:w-[85%] h-auto border border-gray-200 shadow-sm 
     dark:bg-[#1e1f23] dark:border-gray-700">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
        Notification Preference
      </h1>

      {/* Email Notifications */}
      <div>
        <div className="flex flex-row items-center justify-between text-gray-800 dark:text-gray-100">
          <div className="flex flex-col items-start gap-2">
            <h2>Email Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive email updates about your projects
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences?.emailNotifications}
              onChange={() =>
                updatePreference(
                  "emailNotifications",
                  !preferences?.emailNotifications
                )
              }
            />
            <div
              className={`w-14 h-7 rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-300 
                ${preferences?.emailNotifications ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300 
                ${preferences?.emailNotifications ? "translate-x-7 bg-white" : "bg-gray-500 dark:bg-gray-400"}`}
            />
          </label>
        </div>
        <hr className="border-gray-200 dark:border-gray-700 my-3" />
      </div>

      {/* Task Assignments */}
      <div>
        <div className="flex flex-row items-center justify-between text-gray-800 dark:text-gray-100">
          <div className="flex flex-col items-start gap-2">
            <h2>Task Assignments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get notified when you're assigned to a task
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={preferences?.taskAssignments}
              disabled={!preferences?.emailNotifications}
              onChange={() =>
                updatePreference(
                  "taskAssignments",
                  !preferences?.taskAssignments
                )
              }
            />
            <div
              className={`w-14 h-7 rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-300 
                ${preferences?.taskAssignments ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300 
                ${preferences?.taskAssignments ? "translate-x-7 bg-white" : "bg-gray-500 dark:bg-gray-400"}`}
            />
          </label>
        </div>
        <hr className="border-gray-200 dark:border-gray-700 my-3" />
      </div>

      {/* Project Updates */}
      <div>
        <div className="flex flex-row items-center justify-between text-gray-800 dark:text-gray-100">
          <div className="flex flex-col items-start gap-2">
            <h2>Project Updates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Receive updates about project progress
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={!preferences?.emailNotifications}
              checked={preferences?.projectUpdates}
              onChange={() =>
                updatePreference("projectUpdates", !preferences?.projectUpdates)
              }
            />
            <div
              className={`w-14 h-7 rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-300 
                ${preferences?.projectUpdates ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300 
                ${preferences?.projectUpdates ? "translate-x-7 bg-white" : "bg-gray-500 dark:bg-gray-400"}`}
            />
          </label>
        </div>
        <hr className="border-gray-200 dark:border-gray-700 my-3" />
      </div>

      {/* Weekly Reports */}
      <div>
        <div className="flex flex-row items-center justify-between text-gray-800 dark:text-gray-100">
          <div className="flex flex-col items-start gap-2">
            <h2>Weekly Reports</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get weekly progress reports via email
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              disabled={!preferences?.emailNotifications}
              checked={preferences?.weeklyReports}
              onChange={() =>
                updatePreference("weeklyReports", !preferences?.weeklyReports)
              }
            />
            <div
              className={`w-14 h-7 rounded-full border border-gray-300 dark:border-gray-600 transition-colors duration-300 
                ${preferences?.weeklyReports ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
            <div
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300 
                ${preferences?.weeklyReports ? "translate-x-7 bg-white" : "bg-gray-500 dark:bg-gray-400"}`}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreference;

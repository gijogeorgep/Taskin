import React, { useState } from "react";

import user from "../assets/user.png";
import notification from "../assets/notification.png";
import verified from "../assets/verified.png";
import ProfileSettings from "../components/ProfileSettings";
import NotificationPreferance from "../components/NotificationPreferance";
import SecuritySetting from "../components/SecuritySetting";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen pt-2  
      bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 
      dark:from-[#252526] dark:via-[#2c2d31] dark:to-[#3a3b40] 
      px-4 lg:pl-64"
    >
      {/* Sidebar */}
      <div className="w-full lg:w-[40%] p-4">
        <div className="flex flex-col gap-3 ml-4 mb-8">
          <h1 className="font-bold text-3xl md:text-5xl text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Manage your account and application preferences
          </p>
        </div>
        
        <div className="bg-white dark:bg-[#2e2f33] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex flex-col gap-1">
            {/* Profile */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "profile" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={user} 
                  alt="Profile"
                />
              </div>
              <span className="font-medium text-base">Profile</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setActiveTab("notification")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "notification"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "notification" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={notification} 
                  alt="Notification"
                />
              </div>
              <span className="font-medium text-base">Notifications</span>
            </button>

            {/* Security */}
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "security"
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "security" ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={verified} 
                  alt="Security"
                />
              </div>
              <span className="font-medium text-base">Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col items-center justify-start gap-10 mt-8 lg:mt-24 p-4">
        <div className="w-full max-w-4xl">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notification" && <NotificationPreferance />}
          {activeTab === "security" && <SecuritySetting />}
        </div>
      </div>
    </div>
  );
}

export default Settings;

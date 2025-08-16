import React, { useState } from "react";

import user from "../assets/user.png";
import notification from "../assets/notification.png";
import verified from "../assets/verified.png";
// import CustomField from "../assets/customField.png";
// import palette from "../assets/palette.png";
import ProfileSettings from "../components/ProfileSettings";
import NotificationPreferance from "../components/NotificationPreferance";
import SecuritySetting from "../components/SecuritySetting";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen pt-2 bg-gray-50 px-4 lg:pl-64">
      {/* Sidebar */}
      <div className="w-full lg:w-[40%] p-4">
        <div className="flex flex-col gap-3 ml-4 mb-8">
          <h1 className="font-bold text-3xl md:text-5xl text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your account and application preferences
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "profile" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={user} 
                  alt="Profile"
                  style={{ 
                    filter: activeTab === "profile" 
                      ? "brightness(0) saturate(100%) invert(35%) sepia(92%) saturate(1804%) hue-rotate(213deg) brightness(101%) contrast(101%)" 
                      : "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(339%) hue-rotate(314deg) brightness(96%) contrast(88%)"
                  }}
                />
              </div>
              <span className="font-medium text-base">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("notification")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "notification"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "notification" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={notification} 
                  alt="Notification"
                  style={{ 
                    filter: activeTab === "notification" 
                      ? "brightness(0) saturate(100%) invert(35%) sepia(92%) saturate(1804%) hue-rotate(213deg) brightness(101%) contrast(101%)" 
                      : "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(339%) hue-rotate(314deg) brightness(96%) contrast(88%)"
                  }}
                />
              </div>
              <span className="font-medium text-base">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "security"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "security" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={verified} 
                  alt="Security"
                  style={{ 
                    filter: activeTab === "security" 
                      ? "brightness(0) saturate(100%) invert(35%) sepia(92%) saturate(1804%) hue-rotate(213deg) brightness(101%) contrast(101%)" 
                      : "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(339%) hue-rotate(314deg) brightness(96%) contrast(88%)"
                  }}
                />
              </div>
              <span className="font-medium text-base">Security</span>
            </button>

{/* 
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "appearance"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "appearance" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={palette} 
                  alt="Appearance"
                  style={{ 
                    filter: activeTab === "appearance" 
                      ? "brightness(0) saturate(100%) invert(35%) sepia(92%) saturate(1804%) hue-rotate(213deg) brightness(101%) contrast(101%)" 
                      : "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(339%) hue-rotate(314deg) brightness(96%) contrast(88%)"
                  }}
                />
              </div>
              <span className="font-medium text-base">Appearance</span>
            </button> */}
            
            {/* <button
              onClick={() => setActiveTab("customfields")}
              className={`flex items-center px-4 gap-3 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === "customfields"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className={`w-5 h-5 flex items-center justify-center rounded-md ${
                activeTab === "customfields" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <img 
                  className="w-4 h-4 opacity-80" 
                  src={CustomField} 
                  alt="Custom field"
                  style={{ 
                    filter: activeTab === "customfields" 
                      ? "brightness(0) saturate(100%) invert(35%) sepia(92%) saturate(1804%) hue-rotate(213deg) brightness(101%) contrast(101%)" 
                      : "brightness(0) saturate(100%) invert(45%) sepia(8%) saturate(339%) hue-rotate(314deg) brightness(96%) contrast(88%)"
                  }}
                />
              </div>
              <span className="font-medium text-base">Custom Fields</span>
            </button> */}
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
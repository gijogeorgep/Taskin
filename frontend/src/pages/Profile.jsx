import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
        
      
        {authUser.profilePic && (
          <img
            src={authUser.profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 mb-4"
          />
        )}

        <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

        <div className="space-y-4 w-full">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-lg font-medium">{authUser.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-lg font-medium">{authUser.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Role</p>
            <p className="text-lg font-medium">{authUser.role}</p>
          </div>

            <div>
            <p className="text-gray-400">Bio</p>
            <p className="text-lg font-medium">{authUser.bio}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;

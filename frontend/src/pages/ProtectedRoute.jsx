import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LockIcon } from "lucide-react";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  // Show loading if auth check is in progress
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Checking authentication...
      </div>
    );
  }

  // 🔐 Redirect to login if not authenticated
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Block if permission is required but user doesn't have it
  if (
    requiredPermission &&
    !authUser.permissions?.includes(requiredPermission)
  ) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4">
        <div className="bg-gray-950 border border-gray-700 rounded-xl p-10 shadow-xl min-w-xl h-[40vh] text-center text-white">
          <div className="flex justify-center mb-6">
            <LockIcon size={48} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 text-sm mb-4">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

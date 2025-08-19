import React, { useState } from "react";
import { Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore"; // Make sure path is correct
import { toast } from "react-hot-toast"; // If you're using react-toastify

export default function SecuritySetting() {
  const { updatepassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await updatepassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="w-full max-w-lg mx-auto p-4 sm:p-6 border border-gray-200 rounded-lg bg-white shadow-sm dark:bg-[#1e1f23] dark:border-gray-700">
  <div className="flex items-center gap-2 mb-4">
    <Shield className="h-5 w-5 text-gray-700 dark:text-gray-100" />
    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Security Settings</h2>
  </div>

  <div className="space-y-4">
    <div className="space-y-1">
      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Current Password
      </label>
      <input
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        id="currentPassword"
        type="password"
        className="w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-1">
      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 ">
        New Password
      </label>
      <input
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        id="newPassword"
        type="password"
        className="w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-1">
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300  ">
        Confirm New Password
      </label>
      <input
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        id="confirmPassword"
        type="password"
        className="w-full border border-gray-300 bg-gray-50 text-gray-800 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      onClick={handlePasswordChange}
      disabled={loading}
      className="w-full sm:w-auto mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-500 dark:hover:bg-gray-600 "
    >
      {loading ? "Updating..." : "Update Password"}
    </button>

    <hr className="my-6 border-gray-200" />
  </div>
</div>

  );
}

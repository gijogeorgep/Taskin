import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`auth/change-password`, {
        token,
        password,
      });

      setMessage(response.data.message || "Password changed successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 px-4">
      <div className="bg-gray-900 text-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Set Your New Password
        </h2>
        {message && (
          <p className="text-sm mb-4 text-center text-white">{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-200  mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 bg-white text-black"
            placeholder="Enter new password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-950 text-white py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

import { useState } from "react";
import { axiosInstance } from "../lib/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error sending reset email:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="bg-[#1F2937] min-h-screen flex items-center justify-center py-10 px-4">
      <div className="bg-gray-900 w-full max-w-md  p-6 md:p-10 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
          <input
            type="email"
            className="p-3 rounded-md bg-white text-black"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-gray-950 hover:bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            Send Reset Link
          </button>
        </form>
        {message && <p className="mt-4 text-green-400">{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;

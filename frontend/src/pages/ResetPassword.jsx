import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        await axiosInstance.get(`/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        console.log("Error from check Token Reset Password ", error);
        setTokenValid(false);
      }
    };

    if (token) {
      checkToken();
    } else {
      setTokenValid(false);
    }
  }, [token]);

  const validatePassword = (pwd) => {
    if (!pwd) return "Password is required";
    if (pwd.length < 6) return "Password must be at least 6 characters long";
    // Optional: Uncomment for stronger rules
    // if (!/[A-Z]/.test(pwd)) return "Password must include at least one uppercase letter";
    // if (!/[0-9]/.test(pwd)) return "Password must include at least one number";
    // if (!/[@$!%*?&]/.test(pwd)) return "Password must include at least one special character";
    return "";
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(""); // clear error if valid

    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed.");
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
        <div>
          <p className="text-red-500 text-lg mb-4">This link is expired.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="underline text-blue-400"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#1F2937] text-white">
      <form onSubmit={handleReset} className="bg-gray-900 p-6 shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          className={`w-full p-3 mb-2 rounded placeholder-white text-white border ${
            error ? "border-red-500" : "border-gray-700"
          }`}
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button className="w-full bg-gray-950 hover:bg-gray-800 p-3 rounded">
          Reset Password
        </button>
        {message && <p className="mt-4 text-green-400">{message}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;

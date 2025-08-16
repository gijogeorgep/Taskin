import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login({ email, password });
      navigate("/");
      console.log("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-10 px-4">
      <div className="bg-white w-full max-w-md rounded-md shadow-md overflow-hidden p-6 md:p-10 flex flex-col justify-center items-center gap-6">
        <div className="text-center text-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-base sm:text-lg opacity-80">Access your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-4"
        >
          <input
            className="w-full max-w-md p-3 rounded-md border border-gray-300 bg-white text-gray-800"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full max-w-md p-3 rounded-md border border-gray-300 bg-white text-gray-800"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-md text-center w-full max-w-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

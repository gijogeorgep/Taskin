import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import taskin_dark from "../assets/taskin logo dark.png";

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

  const handleDemoLogin = async () => {
    try {
      await login({ email: "demouser@gmail.com", password: "demo123" }); 
      navigate("/");
      console.log("Demo login successful!");
    } catch (error) {
      console.error("Demo login failed:", error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center px-4">
      {/* Glassmorphism Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 w-full max-w-md rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center gap-6">
        
        {/* Logo + Heading */}
        <div className="text-center text-white">
          <img src={taskin_dark} alt="Taskin Logo" className="w-30 h-auto mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-lg text-gray-300">Access your account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-5"
        >
          <input
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Link
            to="/forgot-password"
            className="text-blue-400 hover:text-blue-300 text-sm "
          >
            Forgot password?
          </Link>

          <button
            type="submit"
            className="bg-blue-600/90 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg w-full transition-all duration-200"
          >
            Sign In
          </button>

           <button
          onClick={handleDemoLogin}
          className="mt-3 bg-green-600/90 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg w-full transition-all duration-200"
        >
          Login as Demo User
        </button>
        </form>

        
     
      </div>
    </div>
  );
}

export default Login;

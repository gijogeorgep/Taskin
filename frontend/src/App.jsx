import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { axiosInstance } from "./lib/axios.js";
import toast from "react-hot-toast";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import CustomFields from "./pages/CustomFields";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import CreateRole from "./pages/CreateRole";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import EditUser from "./pages/EditUser";
import ProtectedRoute from "./pages/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore.js";
import CreateProject from "./pages/CreateProject";
import { Toaster } from "react-hot-toast";
import EditProject from "./pages/EditProject.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ProjectDetails from "./pages/ProjectDetails.jsx";
// import AutoLogin from "./pages/AutoLogin.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

function AppLayout() {
  const location = useLocation();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();
  const logoutUser = useAuthStore((state) => state.logout);
  
  const { theme, setTheme } = useThemeStore();
    useEffect(() => {
    // Apply the stored theme right when the app loads
    setTheme(theme);
  }, []); // run once on mount


  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const msg = error.response?.data?.msg;

        if (
          error.response?.status === 403 &&
          msg?.includes("Account inactive")
        ) {
          toast.error("Your account was deactivated. You’ve been logged out.");
          logoutUser(true);

          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, [logoutUser, navigate]);

  // Run checkAuth once on mount
  useEffect(() => {
    checkAuth();
  }, [logoutUser]);

  useEffect(() => {
    window.onpopstate = () => {
      const isLoginPage = location.pathname === "/login";
      const isUnauthenticated = !authUser;

      if (isUnauthenticated && !isLoginPage) {
        navigate("/login", { replace: true });
      }
    };
  }, [authUser, location.pathname]);

  const hideLayoutPaths = ["/login"];
  const hideLayout = !authUser || hideLayoutPaths.includes(location.pathname);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />

      {!hideLayout && <Header />}
      {!hideLayout && <Sidebar />}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requiredPermission="view_projects">
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createproject"
          element={
            <ProtectedRoute requiredPermission="create_project">
              <CreateProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="view_all">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom"
          element={
            <ProtectedRoute requiredPermission="view_custom_fields">
              <CustomFields />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredPermission="view_reports">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createuser"
          element={
            <ProtectedRoute requiredPermission="create_user">
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createrole"
          element={
            <ProtectedRoute requiredPermission="assign_roles">
              <CreateRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edituser/:userId"
          element={
            <ProtectedRoute requiredPermission="edit_user">
              <EditUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editProject/:projectId"
          element={
            <ProtectedRoute requiredPermission="edit_project">
              <EditProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute requiredPermission="view_projects">
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* <Route path="/invite-login" element={<AutoLogin />} /> */}
        <Route path="/change-password/:token" element={<ChangePassword />} />
      </Routes>
    </>
  );
}



function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

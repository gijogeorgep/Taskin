import SunIcon from "../assets/sun.png";
import sidebarIcon from "../assets/ui.png";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { useNavigate, Link } from "react-router-dom";
import InitialsAvatar from "react-initials-avatar";

function Header() {
  const { logout, authUser } = useAuthStore();
  const { openSidebar } = useSidebarStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (!confirmLogout) return;
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm text-gray-800
                 w-full md:w-[82.3%] md:ml-[17.70%] py-3 px-6
                 flex justify-between items-center">
      <div className="flex flex-row gap-2 items-center">
        {/* <img className="w-5 h-5" src={SunIcon} alt="Sun icon" /> */}
        <Link to="/settings">
          {authUser?.profilePic ? (
            <img
              src={authUser.profilePic}
              alt="Profile"
              className="rounded-full w-10 h-10 object-cover border-2 border-blue-200 hover:border-blue-400 transition-colors"
            />
          ) : (
            <InitialsAvatar
              name={authUser?.name || "User"}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-10 h-10 flex items-center justify-center border-2 border-blue-200 hover:border-blue-400 transition-colors"
            />
          )}
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <img
          onClick={handleLogout}
          width="25"
          height="25"
          src="https://img.icons8.com/ios-filled/666666/50/logout-rounded-up.png"
          alt="logout"
          className="cursor-pointer hover:opacity-70 transition-opacity"
        />
        <div onClick={openSidebar} className="md:hidden cursor-pointer">
          <img src={sidebarIcon} alt="Toggle Sidebar" className="opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
}

export default Header;
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../store/useAuthStore";

// function AutoLogin() {
//   const [tokenValid, setTokenValid] = useState(false);
//   const navigate = useNavigate();
//   const autoLogin = useAuthStore((state) => state.autoLoginWithToken);

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get("token");

//     const handleAutoLogin = async () => {
//       if (!token) {
//         setTokenValid(false);
//         return;
//       }

//       const result = await autoLogin(token);

//       if (result.success) {
//         setTokenValid(true);
//         navigate("/change-password");
//       } else {
//         setTokenValid(false);
//           navigate("/login");
//       }
//     };

//     handleAutoLogin();
//   }, [autoLogin, navigate]);

//   if (!tokenValid) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center">
//         <div>
//           <p className="text-red-500 text-lg mb-4">This link is expired.</p>
//           <button
//             onClick={() => navigate("/login")}
//             className="underline text-blue-400"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//       <p className="text-lg">Logging you in...</p>
//     </div>
//   );
// }

// export default AutoLogin;

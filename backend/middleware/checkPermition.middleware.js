import User from "../models/user.model.js";

// export const checkPermission = (requiredPermission) => {
//   return async (req, res, next) => {
//     try {
//       const user = await User.findById(req.user._id).populate("globalRole");

//       if (!user?.globalRole?.permissions?.includes(requiredPermission)) {
//         return res.status(403).json({ message: "Permission denied" });
//       }

//       next();
//     } catch (error) {
//       console.error("Error in checkPermission middleware:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };
// };

export const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
  // console.log(requiredPermission, "required Permission in checkPermission middleware",);
      
      // console.log("User in checkPermission middleware:", user);
      if (!user?.globalRole?.permissions?.includes(requiredPermission)) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();
    } catch (error) {
      console.error("Error in checkPermission middleware:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

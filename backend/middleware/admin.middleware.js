import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;

export const adminVerify = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        return res
          .status(401)
          .json({ msg: "Unauthorized user - Token missing" });
      }

      const decoded = jwt.verify(token, secretKey);

      const user = await User.findById(decoded._id)
        .select("-password")
        .populate("globalRole");

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (requiredRole && user.globalRole?.name !== requiredRole) {
        return res.status(403).json({ msg: "Forbidden - Insufficient role" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return res.status(403).json({ msg: "Invalid or expired token" });
    }
  };
};

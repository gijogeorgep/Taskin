import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      console.log(" No token in cookies");
      return res.status(401).json({ msg: "No token. Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("globalRole");

    if (!user) {
      console.log("protect route middleware User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.status === "inactive") {
      return res
        .status(403)
        .json({ msg: "Account inactive. Please contact admin." });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ msg: "verifyJwt error", error: error.message });
  }
};

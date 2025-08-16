import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",  // REQUIRED for cross-site
  maxAge: 30 * 24 * 60 * 60 * 1000
});

  return token;
};

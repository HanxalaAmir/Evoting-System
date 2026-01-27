const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const asyncHandler = require("./asyncHandler");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    console.log("No token found in cookies");
    throw new AppError("Not authorized, no token", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
  } catch (error) {
    console.log("JWT verification failed:", error.message);
    throw new AppError("Not authorized, token failed", 401);
  }

  const userId = decoded.userId || decoded.id;
  console.log("Fetching user with id:", userId);

  const { data: user, error } = await supabase
    .from("users")
    .select("id, full_name, username, email, role, two_factor_enabled")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("Error fetching user:", error);
  }
  if (!user) {
    console.log("User not found");
    throw new AppError("Not authorized, user not found", 401);
  }

  req.user = user;
  next();
});

const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    next(new AppError("Not authorized as an admin", 403));
  }
};

module.exports = { protect, admin };

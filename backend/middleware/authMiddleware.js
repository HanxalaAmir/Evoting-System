const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const asyncHandler = require("./asyncHandler");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    throw new AppError("Not authorized, no token", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, username, email, role, two_factor_enabled")
    .eq("id", decoded.userId)
    .single();

  if (!user) {
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

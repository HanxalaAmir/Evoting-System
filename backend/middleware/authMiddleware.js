const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");
const asyncHandler = require("./asyncHandler");
const AppError = require("../utils/AppError");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, no token", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, username, email, role")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new AppError("Not authorized, user not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError("Not authorized, token failed", 401);
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new AppError("Not authorized as an admin", 403));
  }
};

module.exports = { protect, admin };
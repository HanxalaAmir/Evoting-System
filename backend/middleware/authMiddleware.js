const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

const protect = async (req, res, next) => {
  let token;

  // 1. Read Token
  token = req.cookies.jwt;

  if (token) {
    try {
      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log("🔍 Middleware Debug:");
      console.log("   - Token Decoded User ID:", decoded.userId);

      // 3. Fetch User
      const { data: user, error } = await supabase
        .from('users')
        .select('id, full_name, username, email, role, two_factor_enabled')
        .eq('id', decoded.userId)
        .single();

      // LOG THE DATABASE RESPONSE
      if (error) console.error("   - DB Error:", error.message);
      if (user) console.log("   - DB User Found:", user.email);
      else console.log("   - DB User: NULL (Not Found)");

      if (error || !user) {
        throw new Error('User not found in database');
      }

      // 4. Attach & Next
      req.user = user;
      next();

    } catch (error) {
      console.error("❌ Auth Middleware Failed:", error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log("❌ Auth Middleware: No Token Found in Cookies");
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
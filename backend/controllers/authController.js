const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sendEmailOTP } = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const sendOTP = asyncHandler(async (req, res, next) => {
  const { email, type } = req.body;

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (type === 'register' && existingUser) {
    throw new AppError('Email already registered. Please login.', 400);
  }
  if (type === 'reset' && !existingUser) {
    throw new AppError('User not found.', 404);
  }

  await supabase.from('otp_codes').delete().eq('email', email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60000);

  const { error } = await supabase
    .from('otp_codes')
    .insert([{ email, code: otp, type, expires_at: expiresAt }]);

  if (error) throw new AppError('Database error while saving OTP', 500);

  await sendEmailOTP(email, otp, type);

  res.status(200).json({ message: 'OTP sent successfully.' });
});

const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, type } = req.body;

  const { data: record } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', otp)
    .eq('type', type)
    .maybeSingle();

  if (!record) {
    throw new AppError('Invalid or incorrect OTP.', 400);
  }

  if (new Date() > new Date(record.expires_at)) {
    throw new AppError('OTP has expired.', 400);
  }

  res.status(200).json({ message: 'OTP Verified successfully.' });
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password, role, secretCode, otp } = req.body;

  const { data: otpRecord } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', otp)
    .eq('type', 'register')
    .maybeSingle();

  if (!otpRecord) {
    throw new AppError('Invalid or expired OTP.', 400);
  }

  if (role === 'admin') {
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      throw new AppError('Invalid Admin Authorization Code.', 403);
    }
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  if (existing) {
    throw new AppError('Username or Email already taken.', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      full_name: fullName,
      username,
      email,
      password: hashedPassword,
      role: role || 'voter',
      is_verified: true
    }])
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);

  await supabase.from('otp_codes').delete().eq('email', email);

  generateToken(res, user.id, user.role);

  res.status(201).json({
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { identifier, password, role } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .maybeSingle();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials.', 401);
  }

  if (role && user.role !== role) {
    throw new AppError(`Access Denied. This account is not authorized for ${role} access.`, 403);
  }

  generateToken(res, user.id, user.role);

  res.status(200).json({
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role
  });
});

const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: 'none'
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.status(200).json({
      id: req.user.id,
      fullName: req.user.full_name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    });
  } else {
    throw new AppError('User context not found.', 404);
  }
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ full_name: fullName })
    .eq('id', req.user.id)
    .select('id, full_name, username, email, role')
    .single();

  if (error) throw new AppError('Profile update failed.', 500);
  res.status(200).json(data);
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('password')
    .eq('id', req.user.id)
    .single();

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('Current password incorrect.', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  await supabase
    .from('users')
    .update({ password: hash })
    .eq('id', req.user.id);

  res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  sendOTP,
  verifyOTP,
  updateProfile,
  changePassword
};
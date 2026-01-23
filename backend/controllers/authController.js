const supabase = require('../config/supabaseClient');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// --- 1. CORE AUTH ---

// Register
const registerUser = async (req, res) => {
  const { fullName, username, email, password, role, secretCode } = req.body;

  try {
    if (role === 'admin' && secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Invalid Admin Code' });
    }

    const { data: existing } = await supabase.from('users').select('id').or(`email.eq.${email},username.eq.${username}`).single();
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name: fullName, username, email, password: hashedPassword, role, is_verified: true }])
      .select()
      .single();

    if (error) throw error;

    generateToken(res, data.id, data.role);

    // Response Mapping
    res.status(201).json({
      id: data.id,
      fullName: data.full_name, // Map DB full_name to Frontend fullName
      username: data.username,
      email: data.email,
      role: data.role
    });

  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { identifier, password, role } = req.body;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. Not a ${role} account.` });
    }

    generateToken(res, user.id, user.role);

    // Response Mapping
    res.json({
      id: user.id,
      fullName: user.full_name, // Map DB full_name to Frontend fullName
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.two_factor_enabled
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};

// Get Current User (FIXED)
const getCurrentUser = async (req, res) => {
  if (req.user) {
    // Explicitly map the fields here
    res.json({
      id: req.user.id,
      fullName: req.user.full_name, // <--- THIS WAS THE MISSING LINK
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      twoFactorEnabled: req.user.two_factor_enabled
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// --- 2. PROFILE MANAGEMENT ---

// Update Profile (FIXED)
const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ full_name: fullName }) // Update DB column full_name
      .eq('id', req.user.id)
      .select('id, full_name, username, email, role, two_factor_enabled')
      .single();

    if (error) throw error;

    // Return mapped data
    res.json({
      id: data.id,
      fullName: data.full_name, // Map back for frontend update
      username: data.username,
      email: data.email,
      role: data.role,
      twoFactorEnabled: data.two_factor_enabled
    });

  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: user } = await supabase.from('users').select('password').eq('id', req.user.id).single();

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await supabase.from('users').update({ password: hash }).eq('id', req.user.id);
    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Password change failed' });
  }
};

// --- 3. 2FA SYSTEM ---

const enable2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `UniVoting (${req.user.username})` });
    await supabase.from('users').update({ two_factor_secret: secret.base32 }).eq('id', req.user.id);

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) throw err;
      res.json({ secret: secret.base32, qrCodeUrl: data_url });
    });
  } catch (error) {
    res.status(500).json({ message: '2FA Setup failed' });
  }
};

const verify2FA = async (req, res) => {
  const { token } = req.body;
  try {
    const { data: user } = await supabase.from('users').select('two_factor_secret').eq('id', req.user.id).single();

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      await supabase.from('users').update({ two_factor_enabled: true }).eq('id', req.user.id);
      res.json({ message: '2FA Enabled Successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP Code' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
};

const disable2FA = async (req, res) => {
  try {
    await supabase.from('users').update({ two_factor_enabled: false, two_factor_secret: null }).eq('id', req.user.id);
    res.json({ message: '2FA Disabled' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
};

const sendOTP = async (req, res) => {
  res.json({ message: 'OTP Sent (Simulated)' });
};

module.exports = {
  registerUser, loginUser, logoutUser, getCurrentUser,
  updateProfile, changePassword,
  enable2FA, verify2FA, disable2FA, sendOTP
};
// -----------------------------------------------------------------------------
// authController.js — registration, login, silent token refresh, and logout.
//
// Access token  -> returned in the JSON body, kept in React state/memory only.
// Refresh token -> set as an httpOnly, sameSite cookie so it can't be read
//                  by client-side JS (mitigates XSS token theft) and is
//                  automatically re-sent by the browser on /refresh calls.
// -----------------------------------------------------------------------------

const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // requires HTTPS in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth', // only sent back to auth routes, reduces exposure
};

const PUBLIC_REGISTRATION_ROLES = ['citizen', 'rescue_team', 'hospital', 'shelter', 'volunteer', 'ngo'];

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'citizen', organizationName, phone, verificationDocument } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (typeof name !== 'string' || !name.trim() || !normalizedEmail || typeof password !== 'string') {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (name.trim().length > 120 || normalizedEmail.length > 254 || password.length > 128) {
    res.status(400);
    throw new Error('Name, email, or password exceeds the allowed length');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error('A valid email address is required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
    res.status(403);
    throw new Error('This account role cannot be registered publicly');
  }
  if (role !== 'citizen') {
    const documentData = verificationDocument?.dataUrl;
    if (typeof documentData !== 'string' || !/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+=*$/.test(documentData) || documentData.length > 2_800_000) {
      res.status(400);
      throw new Error('Organization accounts must include a PNG, JPEG, or WebP verification image under 2 MB');
    }
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const NON_CITIZEN_ROLES = ['eoc', 'hospital', 'shelter', 'rescue_team', 'ngo', 'volunteer'];
  const docPayload =
    NON_CITIZEN_ROLES.includes(role) && verificationDocument?.dataUrl
      ? {
          dataUrl: verificationDocument.dataUrl,
          fileName: verificationDocument.fileName || '',
          status: 'pending', // awaiting EOC/admin review
          uploadedAt: new Date(),
        }
      : undefined;

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'citizen',
    organizationName,
    phone,
    verificationDocument: docPayload,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ success: true, user, accessToken });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || normalizedEmail.length > 254 || typeof password !== 'string' || password.length > 128) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshTokenHash');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, user, accessToken });
});

// @route POST /api/auth/refresh
// Called silently by the frontend's axios interceptor when a request gets a
// 401, so the user doesn't get logged out just because 15 minutes passed.
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(401);
    throw new Error('Refresh token invalid or expired — please log in again');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    res.status(401);
    throw new Error('Session no longer valid — please log in again');
  }

  const matches = await bcrypt.compare(token, user.refreshTokenHash);
  if (!matches) {
    res.status(401);
    throw new Error('Refresh token does not match — please log in again');
  }

  const accessToken = generateAccessToken(user);
  res.json({ success: true, accessToken });
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // token already invalid — nothing to clean up server-side
    }
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, refresh, logout, getMe };

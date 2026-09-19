import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const resetPasswordTemplatePath = new URL(
  '../templates/reset-password-email.html',
  import.meta.url,
);

const passwordResetSuccessMessage = {
  message: 'Password reset email sent successfully',
};

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw createHttpError(400, 'Email in use');
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
  });

  const session = await createSession(newUser._id);
  setSessionCookies(res, session);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.json(user);
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({ _id: sessionId });
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);
  res.json({ message: 'Session refreshed' });
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json(passwordResetSuccessMessage);
  }

  const resetToken = jwt.sign(
    { sub: String(user._id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );
  const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const templateSource = await readFile(resetPasswordTemplatePath, 'utf8');
  const html = Handlebars.compile(templateSource)({
    name: user.username,
    link: resetLink,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json(passwordResetSuccessMessage);
};

export const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
    if (
      typeof payload !== 'object' ||
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashPassword });
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({ message: 'Password reset successfully' });
};

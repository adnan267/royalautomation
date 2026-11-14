import { User } from '../models/index.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';

export async function login(req, res) {
  const { email, password } = req.validated;
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown user / wrong password to avoid account enumeration.
  if (!user || !(await user.comparePassword(password))) throw new HttpError(401, 'Invalid email or password.');
  user.lastLoginAt = new Date();
  await user.save();
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ user: user.toSafeJSON() });
}

export function logout(_req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
  res.json({ ok: true });
}

export function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new HttpError(422, 'Current password is incorrect.', { currentPassword: 'Current password is incorrect.' });
  }
  user.password = newPassword;
  await user.save();
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ ok: true, message: 'Password updated.' });
}

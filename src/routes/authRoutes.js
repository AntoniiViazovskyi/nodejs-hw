import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

const authRoutes = Router();

authRoutes.post(
  '/auth/register',
  celebrate(registerUserSchema, { abortEarly: false }),
  registerUser,
);
authRoutes.post(
  '/auth/login',
  celebrate(loginUserSchema, { abortEarly: false }),
  loginUser,
);
authRoutes.post('/auth/refresh', refreshUserSession);
authRoutes.post('/auth/logout', logoutUser);
authRoutes.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema, { abortEarly: false }),
  requestResetEmail,
);
authRoutes.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema, { abortEarly: false }),
  resetPassword,
);

export default authRoutes;

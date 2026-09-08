import { Router } from 'express';
import { celebrate } from 'celebrate';

import {
  registerUserSchema,
  loginUserSchema,
} from '../validations/authValidation.js';
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';

const authRoutes = Router();

authRoutes.post(
  '/register',
  celebrate(registerUserSchema, { abortEarly: false }),
  registerUser,
);
authRoutes.post(
  '/login',
  celebrate(loginUserSchema, { abortEarly: false }),
  loginUser,
);
authRoutes.post('/refresh', refreshUserSession);
authRoutes.post('/logout', logoutUser);

export default authRoutes;

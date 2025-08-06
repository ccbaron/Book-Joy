import express from 'express';
const router = express.Router();

import { getLoginForm, Logout, postLoginForm } from '../controllers/authControllers.js';

router.get('/login', getLoginForm);
router.post('/login', postLoginForm);
router.get('/logout', Logout);

export default router;
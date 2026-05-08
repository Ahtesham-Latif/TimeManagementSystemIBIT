import express from 'express';
import { 
  loginAdmin,
  createAdmin
} from '../controllers/AdminController.js';

const router = express.Router();

// Assuming this file is mounted in your main server.js as: 
// app.use('/api/admins', adminRoutes);

// --- ROUTES ---
router.post('/login', loginAdmin);         // POST /api/admins/login
router.post('/', createAdmin);             // POST /api/admins

export default router;
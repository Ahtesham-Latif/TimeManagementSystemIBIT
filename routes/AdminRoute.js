import express from 'express';
import { 
  createAdmin, 
  getAllAdmins, 
  getAdminById, 
  updateAdmin, 
  deleteAdmin 
} from '../controllers/AdminController.js';

const router = express.Router();

// Full paths will be: /api/admins
router.post('/', createAdmin);           // POST /api/admins
router.get('/', getAllAdmins);           // GET /api/admins
router.get('/:id', getAdminById);        // GET /api/admins/:id
router.put('/:id', updateAdmin);         // PUT /api/admins/:id
router.delete('/:id', deleteAdmin);      // DELETE /api/admins/:id

export default router;

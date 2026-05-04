import express from 'express';
import { 
  createSpecialization, 
  getAllSpecializations, 
  getSpecializationById, 
  updateSpecialization, 
  deleteSpecialization 
} from '../controllers/SpecializationController.js';

const router = express.Router();

// Full paths will be: /api/specializations
router.post('/', createSpecialization);           // POST /api/specializations
router.get('/', getAllSpecializations);          // GET /api/specializations
router.get('/:id', getSpecializationById);        // GET /api/specializations/:id
router.put('/:id', updateSpecialization);         // PUT /api/specializations/:id
router.delete('/:id', deleteSpecialization);      // DELETE /api/specializations/:id

export default router;

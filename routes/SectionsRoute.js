import express from 'express';
import { 
  createSection, 
  getAllSections, 
  getSectionById, 
  updateSection, 
  deleteSection 
} from '../controllers/SectionController.js';

const router = express.Router();

// Full paths will be: /api/sections
router.post('/', createSection);                    // POST /api/sections
router.get('/', getAllSections);                    // GET /api/sections
router.get('/:section_name', getSectionById);       // GET /api/sections/:section_name
router.put('/:section_name', updateSection);        // PUT /api/sections/:section_name
router.delete('/:section_name', deleteSection);     // DELETE /api/sections/:section_name

export default router;
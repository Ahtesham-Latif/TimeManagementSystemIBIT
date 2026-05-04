import express from 'express';
import { 
  createSlot, 
  getAllSlots, 
  getSlotById, 
  updateSlot, 
  deleteSlot 
} from '../controllers/SlotController.js';

const router = express.Router();

// Full paths will be: /api/slots
router.post('/', createSlot);           // POST /api/slots
router.get('/', getAllSlots);           // GET /api/slots
router.get('/:id', getSlotById);        // GET /api/slots/:id
router.put('/:id', updateSlot);         // PUT /api/slots/:id
router.delete('/:id', deleteSlot);      // DELETE /api/slots/:id

export default router;

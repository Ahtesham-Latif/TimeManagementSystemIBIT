import express from 'express';
import { 
  createCommunication, 
  getAllCommunications, 
  getCommunicationById, 
  updateCommunication, 
  deleteCommunication 
} from '../controllers/CommunicationController.js';

const router = express.Router();

// Full paths will be: /api/communications
router.post('/', createCommunication);           // POST /api/communications
router.get('/', getAllCommunications);           // GET /api/communications
router.get('/:id', getCommunicationById);        // GET /api/communications/:id
router.put('/:id', updateCommunication);         // PUT /api/communications/:id
router.delete('/:id', deleteCommunication);      // DELETE /api/communications/:id

export default router;

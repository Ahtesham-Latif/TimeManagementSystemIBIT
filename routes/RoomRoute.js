import express from 'express';
import { 
  createRoom, 
  getAllRooms, 
  getRoomById, 
  updateRoom, 
  deleteRoom 
} from '../controllers/RoomController.js';

const router = express.Router();

// Full paths will be: /api/rooms
router.post('/', createRoom);           // POST /api/rooms
router.get('/', getAllRooms);           // GET /api/rooms
router.get('/:id', getRoomById);        // GET /api/rooms/:id
router.put('/:id', updateRoom);         // PUT /api/rooms/:id
router.delete('/:id', deleteRoom);      // DELETE /api/rooms/:id

export default router;

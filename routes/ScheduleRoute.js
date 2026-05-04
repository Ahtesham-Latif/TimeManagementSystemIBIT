import express from 'express';
import { 
  createSchedule, 
  getAllSchedules, 
  getScheduleById, 
  updateSchedule, 
  deleteSchedule 
} from '../controllers/ScheduleController.js';

const router = express.Router();

// Full paths will be: /api/schedules
router.post('/', createSchedule);           // POST /api/schedules
router.get('/', getAllSchedules);           // GET /api/schedules
router.get('/:id', getScheduleById);        // GET /api/schedules/:id
router.put('/:id', updateSchedule);         // PUT /api/schedules/:id
router.delete('/:id', deleteSchedule);      // DELETE /api/schedules/:id

export default router;

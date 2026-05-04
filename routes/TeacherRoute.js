import express from 'express';
import { 
  createTeacher, 
  getAllTeachers, 
  getTeacherById, 
  updateTeacher, 
  deleteTeacher 
} from '../controllers/TeacherController.js';

const router = express.Router();

// Full paths will be: /api/teachers
router.post('/', createTeacher);           // POST /api/teachers
router.get('/', getAllTeachers);           // GET /api/teachers
router.get('/:id', getTeacherById);        // GET /api/teachers/:id
router.put('/:id', updateTeacher);         // PUT /api/teachers/:id
router.delete('/:id', deleteTeacher);      // DELETE /api/teachers/:id

export default router;

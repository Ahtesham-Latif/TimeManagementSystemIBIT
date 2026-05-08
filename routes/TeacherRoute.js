import express from 'express';
import { 
  createTeacher, 
  getAllTeachers, 
  getTeacherById, 
  updateTeacher, 
  deleteTeacher,
  loginTeacher // <-- 1. Import the new login function
} from '../controllers/TeacherController.js';

const router = express.Router();

// Full paths will be: /api/teachers
router.post('/', createTeacher);           // POST /api/teachers
router.get('/', getAllTeachers);           // GET /api/teachers
router.get('/:id', getTeacherById);        // GET /api/teachers/:id
router.put('/:id', updateTeacher);         // PUT /api/teachers/:id
router.delete('/:id', deleteTeacher);      // DELETE /api/teachers/:id

// --- NEW LOGIN ROUTE ---
router.post('/login', loginTeacher);       // POST /api/teachers/login

export default router;
import express from 'express';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse 
} from '../controllers/CourseController.js';

const router = express.Router();

// Full paths will be: /api/courses
router.post('/', createCourse);           // POST /api/courses
router.get('/', getAllCourses);           // GET /api/courses
router.get('/:id', getCourseById);        // GET /api/courses/:id
router.put('/:id', updateCourse);         // PUT /api/courses/:id
router.delete('/:id', deleteCourse);      // DELETE /api/courses/:id

export default router;

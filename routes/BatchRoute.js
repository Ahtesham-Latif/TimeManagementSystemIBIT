import express from 'express';
import { 
  createBatch, 
  getAllBatches, 
  getBatchById, 
  updateBatch, 
  deleteBatch 
} from '../controllers/BatchController.js';

const router = express.Router();

// Full paths will be: /api/batches
router.post('/', createBatch);           // POST /api/batches
router.get('/', getAllBatches);          // GET /api/batches
router.get('/:id', getBatchById);        // GET /api/batches/:id
router.put('/:id', updateBatch);         // PUT /api/batches/:id
router.delete('/:id', deleteBatch);      // DELETE /api/batches/:id

export default router;
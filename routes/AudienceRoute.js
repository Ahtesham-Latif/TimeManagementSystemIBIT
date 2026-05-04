import express from 'express';
import { 
  createAudience, 
  getAllAudiences, 
  getAudienceById, 
  updateAudience, 
  deleteAudience 
} from '../controllers/AudienceController.js';

const router = express.Router();

const normalizeAudienceSectionNames = (req, res, next) => {
  const body = req.body ?? {};
  const sectionNames = body.section_names ?? body.section_ids ?? body.sections;

  if (sectionNames !== undefined) {
    if (Array.isArray(sectionNames)) {
      body.section_names = sectionNames
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join('+');
    } else {
      body.section_names = String(sectionNames)
        .split('+')
        .map((item) => item.trim())
        .filter(Boolean)
        .join('+');
    }
  }

  delete body.section_ids;
  delete body.sections;
  req.body = body;
  next();
};

// Full paths will be: /api/audiences
router.post('/', normalizeAudienceSectionNames, createAudience);           // POST /api/audiences
router.get('/', getAllAudiences);           // GET /api/audiences
router.get('/:id', getAudienceById);        // GET /api/audiences/:id
router.put('/:id', normalizeAudienceSectionNames, updateAudience);         // PUT /api/audiences/:id
router.delete('/:id', deleteAudience);      // DELETE /api/audiences/:id

export default router;

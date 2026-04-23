const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');

const {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitOnboarding,
} = require('../controllers/events')
const authMiddleware = require('../middlewares/session');
const { onboardingSchema, createEventSchema, updateEventSchema } = require('../validators/events');
 
// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

router.get('/me', authMiddleware, getMyEvents)

router.post('/', authMiddleware, validateSchema(createEventSchema), createEvent)

router.patch('/:id', authMiddleware, validateSchema(updateEventSchema), updateEvent)

router.delete('/:id', authMiddleware, deleteEvent)


router.patch('/:id/onboarding', authMiddleware, validateSchema(onboardingSchema), submitOnboarding)

// Detalle de evento
// GET /api/events/:id
router.get('/:id', getEventById)

module.exports = router;

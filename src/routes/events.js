import express from 'express'
import validateSchema from '../middlewares/validator.js'

import {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitOnboarding,
} from '../controllers/events.js'
import authMiddleware from '../middlewares/session.js'
import { onboardingSchema, createEventSchema, updateEventSchema } from '../validators/events.js'

const router = express.Router()
 
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

export default router

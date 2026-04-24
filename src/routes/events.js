import { Router } from 'express'
import validateSchema from '../middlewares/validator.js'
import authMiddleware from '../middlewares/session.js'
import { 
  onboardingSchema, 
  createEventSchema, 
  updateEventSchema 
} from '../validators/events.js'

import {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  submitOnboarding,
  getInbox,
  updateApplication,
  applyToEvent,
} from '../controllers/events.js'

const router = Router()

// --- 1. Rutas de CONSULTA PÚBLICA (Catálogo) ---
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

// --- 2. Rutas PRIVADAS / ESPECÍFICAS ---
// IMPORTANTE: Deben ir antes de '/:id' para que Express no las confunda con un ID.
router.get('/mine', authMiddleware, getMyEvents)
router.get('/inbox', authMiddleware, getInbox)

// --- 3. Rutas por ID (Dinámicas) ---
router.get('/:id', getEventById)

// --- 4. Gestión de Eventos (Creación, Edición, Borrado) ---
router.post('/', authMiddleware, validateSchema(createEventSchema), createEvent)
router.patch('/:id', authMiddleware, validateSchema(updateEventSchema), updateEvent)
router.delete('/:id', authMiddleware, deleteEvent)

// --- 5. Flujos de Negocio (Onboarding y Aplicaciones) ---
router.patch('/:id/onboarding', authMiddleware, validateSchema(onboardingSchema), submitOnboarding)
router.post('/:id/apply', authMiddleware, applyToEvent)
router.patch('/:id/applications/:appId', authMiddleware, updateApplication)

export default router
import { Router } from 'express'
import validateSchema from '../middlewares/validator.js'
import authMiddleware from '../middlewares/session.js'
import checkRole from '../middlewares/role.js'

import { 
  onboardingSchema, 
  createEventSchema, 
  updateEventSchema,
  applyEventSchema,
  updateApplicationSchema
} from '../validators/events.js'

import {
  getEvents,
  getMyEvents,
  getEventById,
  getEventDashboard,
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
router.get('/mine', authMiddleware, checkRole(['creator']), getMyEvents)
router.get('/inbox', authMiddleware, checkRole(['creator', 'sponsor']), getInbox)

// --- 3. Rutas por ID (Dinámicas) ---
router.get('/:id', getEventById) // Vista pública 
router.get('/:id/dashboard', authMiddleware, checkRole(['creator']), getEventDashboard) // Versión con más detalles para el panel de control del evento

// --- 4. Gestión de Eventos (Creación, Edición, Borrado) ---
router.post('/', authMiddleware,checkRole(['creator']), validateSchema(createEventSchema), createEvent)
router.patch('/:id', authMiddleware, checkRole(['creator']), validateSchema(updateEventSchema), updateEvent)
router.delete('/:id', authMiddleware, checkRole(['creator']), deleteEvent)

// --- 5. Flujos de Negocio (Onboarding y Aplicaciones) ---
router.patch('/:id/onboarding', authMiddleware, checkRole(['creator']), validateSchema(onboardingSchema), submitOnboarding)
router.post('/:id/apply', authMiddleware,checkRole(['sponsor']), validateSchema(applyEventSchema), applyToEvent)
router.patch('/:id/applications/:appId', authMiddleware,checkRole(['creator']), validateSchema(updateApplicationSchema), updateApplication)

export default router

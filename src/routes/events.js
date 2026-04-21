import { Router } from 'express'
import {
    getEvents,
    getEventById,
    getEventByName,
    createEvent,
    submitOnboarding,
    getInbox,
    updateApplication,
} from '../controllers/events.js'
import authMiddleware      from '../middlewares/session.js'
import validateSchema      from '../middlewares/validator.js'
import { onboardingSchema, createEventSchema } from '../validators/events.js'

const router = Router()

// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

// Buzón unificado (creator ve solicitudes recibidas, sponsor las enviadas)
router.get('/inbox', authMiddleware, getInbox)

/**
 * @deprecated — usar GET /api/events?q=nombre en su lugar.
 */
router.get('/name/:name', getEventByName)

// Solo para pruebas — el squad del organizador lo reemplazará.
router.post('/', authMiddleware, validateSchema(createEventSchema), createEvent)

// Detalle de evento
router.get('/:id', getEventById)

// Aceptar / rechazar solicitud de sponsor
router.patch('/:id/applications/:appId', authMiddleware, updateApplication)

// Onboarding del organizador
router.patch('/:id/onboarding', authMiddleware, validateSchema(onboardingSchema), submitOnboarding)

export default router
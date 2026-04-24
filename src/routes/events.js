import { Router } from 'express'
import {
    getEvents,
    getEventById,
    createEvent,
    getInbox,       
    updateApplication,
    getMyEvents,
} from '../controllers/events.js'
import authMiddleware from '../middlewares/session.js'

const router = Router()


// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

// Buzón unificado (creator ve solicitudes recibidas, sponsor las enviadas) ──
router.get('/inbox', authMiddleware, getInbox)

router.get('/mine', authMiddleware, getMyEvents)

// El squad del organizador lo reemplazará con su propia implementación.
router.post('/', createEvent)

// Detalle de evento
router.get('/:id', getEventById)

// Aceptar / rechazar solicitud de sponsor
router.patch('/:id/applications/:appId', authMiddleware, updateApplication)

export default router
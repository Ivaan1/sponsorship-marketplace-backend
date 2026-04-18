import { Router } from 'express'
import {
    getEvents,
    getEventById,
    getEventByName,
    createEvent,
    getInbox,       
    updateApplication,
} from '../controllers/events.js'
import authMiddleware from '../middlewares/session.js'

const router = Router()


// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

// Buzón unificado (creator ve solicitudes recibidas, sponsor las enviadas) ──
router.get('/inbox', authMiddleware, getInbox)

// Solo para pruebas 
// El squad del organizador lo reemplazará con su propia implementación.
router.post('/', createEvent)

// Detalle de evento
router.get('/:id', getEventById)

// Aceptar / rechazar solicitud de sponsor
router.patch('/:id/applications/:appId', authMiddleware, updateApplication)

/**
 * @deprecated
 * Usar GET /api/events?q=nombre en su lugar.
 */
router.get('/name/:name', getEventByName)


export default router
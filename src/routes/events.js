const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');

const { getEvents, getMyEvents, getEventById, getEventByName, createEvent, submitOnboarding, updateEvent } = require('../controllers/events')
const authMiddleware = require('../middlewares/session');
const { onboardingSchema, createEventSchema } = require('../validators/events');

// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

router.post('/', authMiddleware, validateSchema(createEventSchema), createEvent)

/**
 * @deprecated
 * @description Busca un evento por su nombre exacto.
 * @reason Obsoleto. Utilizar el endpoint principal `GET /api/events?q=nombre`
 * que incluye el motor de búsqueda con ranking de relevancia.
 */
router.get('/name/:name', getEventByName);

router.patch('/:id/onboarding', authMiddleware, validateSchema(onboardingSchema), submitOnboarding)

// Eventos del creador logueado (requiere autenticación)
// IMPORTANTE: esta ruta va ANTES de GET /:id, si no Express tratará "mine" como un id
// GET /api/events/mine
router.get('/mine', authMiddleware, getMyEvents)

// Actualización parcial (autosave del formulario crear evento)
// PATCH /api/events/:id
router.patch('/:id', authMiddleware, updateEvent)

// Detalle de evento
// GET /api/events/:id
router.get('/:id', getEventById)

module.exports = router;
const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');

const { getEvents, getEventById, getEventByName, createEvent, submitOnboarding } = require('../controllers/events')
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
router.get('/name/:name',getEventByName);


router.patch('/:id/onboarding', authMiddleware, validateSchema(onboardingSchema), submitOnboarding)

// Detalle de evento
// GET /api/events/:id
router.get('/:id', getEventById)

module.exports = router;

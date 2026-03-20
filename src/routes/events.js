const express = require('express');
const router = express.Router();

const { getEvents, getEventById, getEventByName, createEvent } = require('../controllers/events')

 
// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)

// ── Solo para pruebas ─────────────────────────────────────────────────────────
// El squad del organizador lo reemplazará con su propia implementación.
router.post('/', createEvent)

// Detalle de evento
// GET /api/events/:id
router.get('/:id', getEventById)

/**
 * @deprecated
 * @description Busca un evento por su nombre exacto.
 * @reason Obsoleto. Utilizar el endpoint principal `GET /api/events?q=nombre` 
 * que incluye el motor de búsqueda con ranking de relevancia.
 */
router.get('/name/:name',getEventByName);

module.exports = router;

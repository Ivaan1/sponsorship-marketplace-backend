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
 
router.get('/name/:name',getEventByName);

module.exports = router;

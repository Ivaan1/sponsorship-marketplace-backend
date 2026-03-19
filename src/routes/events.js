const express = require('express');
const router = express.Router();

const { getEvents, getEventById, createEvent } = require('../controllers/events')

// ── Motor de búsqueda (Squad-ColeccionEventos) ────────────────────────────────
 
// Catálogo con filtros y ranking
// GET /api/events?category=concert&sortBy=relevance&page=1
router.get('/', getEvents)
 
// Detalle de evento
// GET /api/events/:id
router.get('/:id', getEventById)
 
// ── Solo para pruebas ─────────────────────────────────────────────────────────
// El squad del organizador lo reemplazará con su propia implementación.
router.post('/', createEvent)
 
module.exports = router
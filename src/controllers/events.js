const { eventsModel, usersModel } = require('../models')
const { handleHttpError }         = require('../utils/handleErrors')
const { rankEvents }              = require('../utils/rankEvents')


// ── GET /api/events ──────────────────────────────────────────────────────────
// Motor de búsqueda — filtra y ordena eventos por relevancia para el sponsor.
//
// Query params:
//  q                → búsqueda libre (nombre, summary)
//  category         → tipo de evento (music, concert, etc.)
//  minAge / maxAge  → rango de edad del público
//  minBudget / maxBudget → rango de presupuesto
//  level            → nivel de patrocinio (gold, silver, etc.)
//  sponsorshipStatus→ open | in_negotiation | closed
//  minReach/maxReach→ asistentes esperados
//  sortBy           → relevance | attendees | budgetAsc | budgetDesc
//  page / limit     → paginación

async function getEvents(req, res) {
    try {
        const {
            q                  = '',
            category,
            minAge,   maxAge,
            minBudget, maxBudget,
            level,
            sponsorshipStatus,
            minReach,  maxReach,
            sortBy             = 'relevance',
            page               = 1,
            limit              = 12,
        } = req.query

        // ── 1. Filtro MongoDB ──────────────────────────────────────────────
        const filter = {
            status: 'published',
            'sponsorship.isLookingForSponsors': true,
        }

        if (q.trim()) {
            filter.$or = [
                { name:    { $regex: q.trim(), $options: 'i' } },
                { summary: { $regex: q.trim(), $options: 'i' } },
            ]
        }

        if (category)filter['sponsorship.category'] = category
        if (level)filter['sponsorship.sponsorshipLevel'] = level
        if (sponsorshipStatus) filter['sponsorship.sponsorshipStatus'] = sponsorshipStatus

        if (minAge)filter['sponsorship.targetAudience.ageRange.max'] = { $gte: Number(minAge) }
        if (maxAge)filter['sponsorship.targetAudience.ageRange.min'] = { $lte: Number(maxAge) }
        if (minBudget) filter['sponsorship.budget.max'] = { $gte: Number(minBudget) }
        if (maxBudget) filter['sponsorship.budget.min'] = { $lte: Number(maxBudget) }

        if (minReach || maxReach) {
            const reachFilter = {}
            if (minReach) reachFilter.$gte = Number(minReach)
            if (maxReach) reachFilter.$lte = Number(maxReach)
            filter['sponsorship.targetAudience.expectedAttendees'] = reachFilter
        }

        // ── 2. Consulta a MongoDB ──────────────────────────────────────────
        const events = await eventsModel
            .find(filter)
            .populate('organizer', 'name email')
            .lean()

        if (!events.length) {
            return res.status(200).json({ data: [], total: 0, page: Number(page), pages: 0 })
        }

        // ── 3. Perfil del sponsor (si está autenticado) ────────────────────
        let sponsor = null
        if (req.user?.id) {
            sponsor = await usersModel.findById(req.user.id).lean()
        }

        // ── 4. Ranking ─────────────────────────────────────────────────────
        let ranked

        if (sortBy === 'relevance') {
            ranked = rankEvents(events, sponsor)
        } else if (sortBy === 'attendees') {
            ranked = [...events].sort((a, b) =>
                (b.sponsorship?.targetAudience?.expectedAttendees ?? 0) -
                (a.sponsorship?.targetAudience?.expectedAttendees ?? 0)
            )
        } else if (sortBy === 'budgetAsc') {
            ranked = [...events].sort((a, b) =>
                (a.sponsorship?.budget?.min ?? 0) - (b.sponsorship?.budget?.min ?? 0)
            )
        } else if (sortBy === 'budgetDesc') {
            ranked = [...events].sort((a, b) =>
                (b.sponsorship?.budget?.min ?? 0) - (a.sponsorship?.budget?.min ?? 0)
            )
        } else {
            ranked = events
        }

        // ── 5. Paginación ──────────────────────────────────────────────────
        const safePage  = Math.max(1, Number(page))
        const safeLimit = Math.min(Math.max(1, Number(limit)), 48)
        const total = ranked.length
        const pages = Math.ceil(total / safeLimit)
        const start = (safePage - 1) * safeLimit
        const paginated = ranked.slice(start, start + safeLimit)

        return res.status(200).json({ data: paginated, total, page: safePage, pages, limit: safeLimit })

    } catch (error) {
        console.error('Error en getEvents:', error)
        handleHttpError(res, error)
    }
}

// ── GET /api/events/:id ──────────────────────────────────────────────────────
// Devuelve el detalle completo de un evento para la ficha.

async function getEventById(req, res) {
    try {
        const event = await eventsModel
            .findById(req.params.id)
            .populate('organizer', 'name email')

        if (!event) return res.status(404).json({ message: 'Evento no encontrado' })

        return res.status(200).json(event)

    } catch (error) {
        console.error('Error en getEventById:', error)
        handleHttpError(res, error)
    }
}

// ── POST /api/events ─────────────────────────────────────────────────────────
// Solo para pruebas — lo eliminará el squad del organizador cuando
// implemente su propio controlador.

async function createEvent(req, res) {
    try {
        const { body } = req
        const data = await eventsModel.create(body)
        res.status(201).json(data)
    } catch (error) {
        console.error('Error creando el evento:', error)
        handleHttpError(res, error)
    }
}

module.exports = { getEvents, getEventById, createEvent }
const { eventsModel, usersModel } = require('../models')
const { handleHttpError } = require('../utils/handleErrors')
const { rankEvents } = require('../utils/rankEvents')


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
      q = '',
      category,
      minAge, maxAge,
      minBudget, maxBudget,
      level,
      sponsorshipStatus,
      minReach, maxReach,
      sortBy = 'relevance',
      page = 1,
      limit = 12,
    } = req.query

    // ── 1. Filtro MongoDB ──────────────────────────────────────────────
    const filter = {
      status: 'published',
      'sponsorship.isLookingForSponsors': true,
    }

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { summary: { $regex: q.trim(), $options: 'i' } },
      ]
    }

    if (category) filter['sponsorship.category'] = category
    if (level) filter['sponsorship.sponsorshipLevel'] = level
    if (sponsorshipStatus) filter['sponsorship.sponsorshipStatus'] = sponsorshipStatus

    if (minAge) filter['sponsorship.targetAudience.ageRange.max'] = { $gte: Number(minAge) }
    if (maxAge) filter['sponsorship.targetAudience.ageRange.min'] = { $lte: Number(maxAge) }
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
    const safePage = Math.max(1, Number(page))
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


// ── GET /api/events/mine ─────────────────────────────────────────────────────
// Devuelve los eventos creados por el usuario autenticado (creador).
// Incluye eventos en cualquier estado (draft, published, cancelled, finished)
// para que el creador pueda ver también sus borradores.

async function getMyEvents(req, res) {
  try {
    const {
      q = '',
      category,
      minBudget, maxBudget,
      level,
      sponsorshipStatus,
      page = 1,
      limit = 12,
    } = req.query

    // ── 1. Filtro: solo eventos del creador logueado ───────────────────
    const filter = {
      organizer: req.user._id,
    }

    if (q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { summary: { $regex: q.trim(), $options: 'i' } },
      ]
    }

    if (category) filter['sponsorship.category'] = category
    if (level) filter['sponsorship.sponsorshipLevel'] = level
    if (sponsorshipStatus) filter['sponsorship.sponsorshipStatus'] = sponsorshipStatus

    if (minBudget) filter['sponsorship.budget.max'] = { $gte: Number(minBudget) }
    if (maxBudget) filter['sponsorship.budget.min'] = { $lte: Number(maxBudget) }

    // ── 2. Consulta ────────────────────────────────────────────────────
    const events = await eventsModel
      .find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })   // Más recientes primero
      .lean()

    // ── 3. Paginación ──────────────────────────────────────────────────
    const safePage = Math.max(1, Number(page))
    const safeLimit = Math.min(Math.max(1, Number(limit)), 48)
    const total = events.length
    const pages = Math.ceil(total / safeLimit)
    const start = (safePage - 1) * safeLimit
    const paginated = events.slice(start, start + safeLimit)

    return res.status(200).json({
      data: paginated,
      total,
      page: safePage,
      pages,
      limit: safeLimit,
    })

  } catch (error) {
    console.error('Error en getMyEvents:', error)
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

async function createEvent(req, res) {
  try {
    const eventData = req.body;

    eventData.organizer = req.user.id;
    eventData.status = "draft"; // Forzamos el borrador

    const newEvent = await eventsModel.create(eventData);

    return res.status(201).json({
      success: true,
      message: "Evento creado con éxito.",
      data: newEvent
    });

  } catch (error) {
    console.error('Error en createEvent:', error);
    return handleHttpError(res, 'ERROR_CREATING_EVENT', 500);
  }
};


async function submitOnboarding(req, res) {
  try {
    const { id } = req.params;
    const sponsorshipData = req.body.sponsorship;

    const event = await eventsModel.findById(id);

    if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404);

    // 2. Seguridad: ¿Es el dueño del evento?
    if (event.organizer.toString() !== req.user.id) {
      return handleHttpError(res, 'UNAUTHORIZED', 403);
    }

    sponsorshipData.isLookingForSponsors = true;
    sponsorshipData.sponsorshipStatus = "open";

    const updatedEvent = await eventsModel.findByIdAndUpdate(
      id,
      {
        $set: {
          sponsorship: sponsorshipData,
          status: "published"
        }
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "¡Onboarding completado! Tu evento ya está visible para los sponsors.",
      data: updatedEvent
    });

  } catch (error) {
    console.error('Error en submitOnboarding:', error);
    return handleHttpError(res, 'ERROR_SUBMITTING_ONBOARDING', 500);
  }
};


// ── PATCH /api/events/:id ────────────────────────────────────────────────────
// Actualización parcial de un evento. Solo el organizador (creador) del evento
// puede modificarlo. Usado por el autosave del formulario "Crear evento".

async function updateEvent(req, res) {
  try {
    const { id } = req.params

    const event = await eventsModel.findById(id)
    if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)

    // Seguridad: solo el organizador puede editar
    if (event.organizer.toString() !== req.user._id.toString()) {
      return handleHttpError(res, 'UNAUTHORIZED', 403)
    }

    const updated = await eventsModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    return res.status(200).json({
      success: true,
      data: updated,
    })

  } catch (error) {
    console.error('Error en updateEvent:', error)
    handleHttpError(res, 'ERROR_UPDATING_EVENT', 500)
  }
}


const getEventByName = async (req, res) => {
  try {
    const { name } = req.params;
    const event = await eventsModel.findOne({ name });

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    handleHttpError(res, error);
  }
};


module.exports = {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  getEventByName,
  submitOnboarding,
  updateEvent,
}
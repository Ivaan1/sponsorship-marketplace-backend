import { eventsModel, usersModel } from '../models/index.js'
import { handleHttpError }         from '../utils/handleErrors.js'
import { rankEvents }              from '../utils/rankEvents.js'


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

        // 1. Filtro MongoDB
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

        if (category)          filter['sponsorship.category']          = category
        if (level)             filter['sponsorship.sponsorshipLevel']   = level
        if (sponsorshipStatus) filter['sponsorship.sponsorshipStatus']  = sponsorshipStatus

        if (minAge)    filter['sponsorship.targetAudience.ageRange.max'] = { $gte: Number(minAge) }
        if (maxAge)    filter['sponsorship.targetAudience.ageRange.min'] = { $lte: Number(maxAge) }
        if (minBudget) filter['sponsorship.budget.max'] = { $gte: Number(minBudget) }
        if (maxBudget) filter['sponsorship.budget.min'] = { $lte: Number(maxBudget) }

        if (minReach || maxReach) {
            const reachFilter = {}
            if (minReach) reachFilter.$gte = Number(minReach)
            if (maxReach) reachFilter.$lte = Number(maxReach)
            filter['sponsorship.targetAudience.expectedAttendees'] = reachFilter
        }

        // 2. Consulta a MongoDB
        const events = await eventsModel
            .find(filter)
            .populate('organizer', 'name email')
            .lean()

        if (!events.length) {
            return res.status(200).json({ data: [], total: 0, page: Number(page), pages: 0 })
        }

        // 3. Perfil del sponsor (si está autenticado)
        let sponsor = null
        if (req.user?.id) {
            sponsor = await usersModel.findById(req.user.id).lean()
        }

        // 4. Ranking ─────────────────────────────────────────────────────
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

        // 5. Paginación
        const safePage  = Math.max(1, Number(page))
        const safeLimit = Math.min(Math.max(1, Number(limit)), 48)
        const total     = ranked.length
        const pages     = Math.ceil(total / safeLimit)
        const start     = (safePage - 1) * safeLimit
        const paginated = ranked.slice(start, start + safeLimit)

        return res.status(200).json({ data: paginated, total, page: safePage, pages, limit: safeLimit })

    } catch (error) {
        console.error('Error en getEvents:', error)
        handleHttpError(res, error)
    }
}


// GET /api/events/:id
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


// GET /api/events/name/:name
// @deprecated — usar GET /api/events?q=nombre

async function getEventByName(req, res) {
    try {
        const { name } = req.params
        const event = await eventsModel.findOne({ name })
        if (!event) return res.status(404).json({ message: 'Evento no encontrado' })
        res.json(event)
    } catch (error) {
        handleHttpError(res, error)
    }
}


// GET /api/events/inbox
// Buzón unificado — devuelve contenido distinto según el rol del usuario.
//
// Creator → solicitudes recibidas en sus eventos
// Sponsor → solicitudes enviadas por él, excluyendo las rechazadas

async function getInbox(req, res) {
    try {
        const { role, _id } = req.user

        if (role === 'creator') {
            // Vista de creator
            const events = await eventsModel
                .find({ organizer: _id })
                .select('name sponsorship.sponsorsApplied')
                .populate({
                    path: 'sponsorship.sponsorsApplied.sponsor',
                    select: 'name sponsorProfile.companyName',
                })
                .lean()

            const inbox = events.flatMap(event =>
                (event.sponsorship?.sponsorsApplied ?? []).map(application => ({
                    eventId:       event._id,
                    eventName:     event.name,
                    applicationId: application._id,
                    status:        application.status,
                    message:       application.message,
                    appliedAt:     application.appliedAt,
                    sponsor: {
                        id:          application.sponsor?._id,
                        name:        application.sponsor?.name,
                        companyName: application.sponsor?.sponsorProfile?.companyName,
                    },
                }))
            )

            inbox.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            return res.status(200).json({ data: inbox, total: inbox.length })

        } else if (role === 'sponsor') {
            // Vista de sponsor: solicitudes enviadas, sin las rechazadas
            const events = await eventsModel
                .find({ 'sponsorship.sponsorsApplied.sponsor': _id })
                .select('name organizer sponsorship.sponsorsApplied')
                .populate({
                    path: 'organizer',
                    select: 'name email',
                })
                .lean()

            const inbox = events.flatMap(event => {
                const myApplications = (event.sponsorship?.sponsorsApplied ?? [])
                    .filter(app =>
                        app.sponsor.toString() === _id.toString() &&
                        app.status !== 'rejected'
                    )

                return myApplications.map(application => ({
                    eventId:       event._id,
                    eventName:     event.name,
                    applicationId: application._id,
                    status:        application.status,
                    message:       application.message,
                    appliedAt:     application.appliedAt,
                    // Solo revela el contacto del creador si fue aceptado
                    creatorContact: application.status === 'accepted'
                        ? {
                            name:  event.organizer?.name,
                            email: event.organizer?.email,
                        }
                        : null,
                }))
            })

            inbox.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            return res.status(200).json({ data: inbox, total: inbox.length })

        } else {
            return handleHttpError(res, 'FORBIDDEN', 403)
        }

    } catch (error) {
        console.error('Error en getInbox:', error)
        handleHttpError(res, error)
    }
}


//  PATCH /api/events/:id/applications/:appId
// El creador acepta o rechaza una solicitud de sponsor.
// Si acepta, la respuesta incluye el email del sponsor para contacto directo.

async function updateApplication(req, res) {
    try {
        if (req.user.role !== 'creator') {
            return handleHttpError(res, 'FORBIDDEN', 403)
        }

        const { id, appId } = req.params
        const { status } = req.body

        if (!['accepted', 'rejected'].includes(status)) {
            return handleHttpError(res, 'INVALID_STATUS', 400)
        }

        // Verifica que el evento existe y pertenece al creador autenticado
        const event = await eventsModel.findOne({
            _id: id,
            organizer: req.user._id,
        })

        if (!event) {
            return handleHttpError(res, 'EVENT_NOT_FOUND', 404)
        }

        // Busca la solicitud dentro del array del evento
        const application = event.sponsorship.sponsorsApplied.id(appId)

        if (!application) {
            return handleHttpError(res, 'APPLICATION_NOT_FOUND', 404)
        }

        application.status = status
        await event.save()

        // Si acepta, revela el contacto del sponsor
        let sponsorContact = null
        if (status === 'accepted') {
            const sponsor = await usersModel
                .findById(application.sponsor)
                .select('name email sponsorProfile.companyName')
                .lean()

            sponsorContact = {
                name:        sponsor.name,
                email:       sponsor.email,
                companyName: sponsor.sponsorProfile?.companyName,
            }
        }

        return res.status(200).json({
            message:       status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada',
            applicationId: appId,
            status,
            ...(sponsorContact && { sponsorContact }),
        })

    } catch (error) {
        console.error('Error en updateApplication:', error)
        handleHttpError(res, error)
    }
}


export {
    getEvents,
    getEventById,
    getEventByName,
    createEvent,
    submitOnboarding,
    getInbox,
    updateApplication,
}
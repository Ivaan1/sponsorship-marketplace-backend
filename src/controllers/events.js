import { eventsModel, usersModel } from '../models/index.js'
import { handleHttpError } from '../utils/handleErrors.js'
import { rankEvents } from '../utils/rankEvents.js'
import { verifyToken } from '../utils/handleJWT.js'

// ── GET /api/events ──────────────────────────────────────────────────────────
// Motor de búsqueda — filtra y ordena eventos por relevancia para el sponsor.
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

        const events = await eventsModel
            .find(filter)
            .populate('organizer', 'name email')
            .lean()

        if (!events.length) {
            return res.status(200).json({ data: [], total: 0, page: Number(page), pages: 0 })
        }

        let sponsor = null
        if (req.user?._id) {
            sponsor = await usersModel.findById(req.user._id).lean()
        }

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

async function getMyEvents(req, res) {
    try {
        const events = await eventsModel
            .find({ organizer: req.user._id })
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({ data: events, total: events.length })
    } catch (error) {
        console.error('Error en getMyEvents:', error)
        handleHttpError(res, 'ERROR_GETTING_MY_EVENTS', 500)
    }
}

async function getEventById(req, res) {
    try {
        const event = await eventsModel
            .findById(req.params.id)
            .populate('organizer', 'name email')

        if (!event) return res.status(404).json({ message: 'Evento no encontrado' })

        if (event.status === 'published') {
            return res.status(200).json(event)
        }

        const authHeader = req.headers.authorization
        if (!authHeader) return handleHttpError(res, 'NO_TOKEN_FOUND', 401)

        const token = authHeader.split(' ').pop()
        const dataToken = await verifyToken(token)
            
        const userId = dataToken._id || dataToken.id;
        if (!userId) return handleHttpError(res, 'INVALID_TOKEN', 401)
    
        const organizerId = event.organizer._id || event.organizer;
    
        if (organizerId.toString() !== userId.toString()) {
            return handleHttpError(res, 'UNAUTHORIZED', 403)
        }

        return res.status(200).json(event)
    } catch (error) {
        console.error('Error en getEventById:', error)
        handleHttpError(res, error)
    }
}

async function createEvent(req, res) {
    try {
        const eventData = req.body
        eventData.organizer = req.user._id
        eventData.status = "draft"

        const newEvent = await eventsModel.create(eventData)
        return res.status(201).json({ success: true, data: newEvent })
    } catch (error) {
        handleHttpError(res, 'ERROR_CREATING_EVENT', 500)
    }
}

async function updateEvent(req, res) {
    try {
        const { id } = req.params
        const event = await eventsModel.findById(id)
        if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)
        if (event.organizer.toString() !== req.user._id.toString()) return handleHttpError(res, 'UNAUTHORIZED', 403)

        const updatedEvent = await eventsModel.findByIdAndUpdate(id, { $set: req.body }, { returnDocument: 'after', runValidators: true })
        return res.status(200).json({ success: true, data: updatedEvent })
    } catch (error) {
        handleHttpError(res, 'ERROR_UPDATING_EVENT', 500)
    }
}

async function deleteEvent(req, res) {
    try {
        const { id } = req.params
        const event = await eventsModel.findById(id)
        if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)
        if (event.organizer.toString() !== req.user._id.toString()) return handleHttpError(res, 'UNAUTHORIZED', 403)

        const deletedEvent = await eventsModel.findByIdAndUpdate(id, {
            $set: { status: 'cancelled', 'sponsorship.isLookingForSponsors': false }
        }, { returnDocument: 'after' })
        return res.status(200).json({ success: true, data: deletedEvent })
    } catch (error) {
        handleHttpError(res, 'ERROR_DELETING_EVENT', 500)
    }
}

async function submitOnboarding(req, res) {
    try {
        const { id } = req.params
        const sponsorshipData = req.body.sponsorship
        const event = await eventsModel.findById(id)
        if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)
        if (event.organizer.toString() !== req.user._id.toString()) return handleHttpError(res, 'UNAUTHORIZED', 403)

        sponsorshipData.isLookingForSponsors = true
        sponsorshipData.sponsorshipStatus = "open"

        const updatedEvent = await eventsModel.findByIdAndUpdate(id, {
            $set: { sponsorship: sponsorshipData, status: "published" }
        }, { returnDocument: 'after', runValidators: true })

        return res.status(200).json({ success: true, data: updatedEvent })
    } catch (error) {
        handleHttpError(res, 'ERROR_SUBMITTING_ONBOARDING', 500)
    }
}

async function getInbox(req, res) {
    try {
        const { role, _id } = req.user
        if (role === 'creator') {
            const events = await eventsModel.find({ organizer: _id })
                .select('name sponsorship.sponsorsApplied')
                .populate({ path: 'sponsorship.sponsorsApplied.sponsor', select: 'name sponsorProfile.companyName' })
                .lean()

            const inbox = events.flatMap(event => (event.sponsorship?.sponsorsApplied ?? []).map(app => ({
                eventId: event._id, eventName: event.name, applicationId: app._id, status: app.status, appliedAt: app.appliedAt,
                sponsor: { id: app.sponsor?._id, name: app.sponsor?.name, companyName: app.sponsor?.sponsorProfile?.companyName }
            })))
            inbox.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            return res.status(200).json({ data: inbox, total: inbox.length })
        } else if (role === 'sponsor') {
            const events = await eventsModel.find({ 'sponsorship.sponsorsApplied.sponsor': _id })
                .select('name organizer sponsorship.sponsorsApplied')
                .populate({ path: 'organizer', select: 'name email' }).lean()

            const inbox = events.flatMap(event => {
                const myApps = (event.sponsorship?.sponsorsApplied ?? []).filter(app => app.sponsor.toString() === _id.toString() && app.status !== 'rejected')
                return myApps.map(app => ({
                    eventId: event._id, eventName: event.name, applicationId: app._id, status: app.status, appliedAt: app.appliedAt,
                    creatorContact: app.status === 'accepted' ? { name: event.organizer?.name, email: event.organizer?.email } : null
                }))
            })
            inbox.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            return res.status(200).json({ data: inbox, total: inbox.length })
        }
        return handleHttpError(res, 'FORBIDDEN', 403)
    } catch (error) {
        handleHttpError(res, error)
    }
}

async function updateApplication(req, res) {
    try {
        if (req.user.role !== 'creator') return handleHttpError(res, 'FORBIDDEN', 403)
        const { id, appId } = req.params
        const { status } = req.body
        if (!['accepted', 'rejected'].includes(status)) return handleHttpError(res, 'INVALID_STATUS', 400)

        const event = await eventsModel.findOne({ _id: id, organizer: req.user._id })
        if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)

        const application = event.sponsorship.sponsorsApplied.id(appId)
        if (!application) return handleHttpError(res, 'APPLICATION_NOT_FOUND', 404)

        application.status = status
        await event.save()

        let sponsorContact = null
        if (status === 'accepted') {
            const sponsor = await usersModel.findById(application.sponsor).select('name email sponsorProfile.companyName').lean()
            sponsorContact = { name: sponsor.name, email: sponsor.email, companyName: sponsor.sponsorProfile?.companyName }
        }
        return res.status(200).json({ status, ...(sponsorContact && { sponsorContact }) })
    } catch (error) {
        console.log('Error en updateApplication:', error)
        handleHttpError(res, 'ERROR_UPDATING_APPLICATION', 500)
    }
}

async function applyToEvent(req, res) {
    try {
        const { id } = req.params
        const sponsorId = req.user._id

        const event = await eventsModel.findById(id)
        if (req.user.role !== 'sponsor') return handleHttpError(res, "SOLO_LOS_SPONSORS_PUEDEN_PATROCINAR", 403);
        if (!event) return handleHttpError(res, 'EVENT_NOT_FOUND', 404)
        if (event.status !== 'published') return handleHttpError(res, 'EVENT_NOT_AVAILABLE', 400)

        const alreadyApplied = event.sponsorship.sponsorsApplied
            .some(app => app.sponsor.toString() === sponsorId.toString())
        if (alreadyApplied) return handleHttpError(res, 'ALREADY_APPLIED', 409)

        event.sponsorship.sponsorsApplied.push({
            sponsor: sponsorId,
            message: req.body.message ?? '',
        })
        await event.save()

        return res.status(201).json({ success: true, message: 'Solicitud enviada correctamente' })
    } catch (error) {
        console.error('Error en applyToEvent:', error)
        handleHttpError(res, 'ERROR_APPLYING_TO_EVENT', 500)
    }
}

export { 
    getEvents, 
    getMyEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    submitOnboarding, 
    getInbox, 
    updateApplication,
    applyToEvent
}
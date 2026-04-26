import request from 'supertest'
import app from './helpers/app.js'
import { connect, disconnect, clearDatabase } from './helpers/db.js'

beforeAll(async () => await connect())
afterEach(async () => await clearDatabase())
afterAll(async () => await disconnect())

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndLogin(role = 'sponsor') {
  const email = `${role}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.com`
  const password = 'password123'
  await request(app).post('/api/auth/register').send({ email, password, role })
  const res = await request(app).post('/api/auth/login').send({ email, password })
  return { token: res.body.token, user: res.body.user }
}

function buildEvent(organizerId) {
  return {
    organizer: organizerId || '507f1f77bcf86cd799439011', // ObjectId válido de prueba
    name: 'Festival Test 2025',
    summary: 'Un evento de prueba para los tests de integración.',
    eventType: 'single',
    singleDate: {
      startTime: '2025-09-01T18:00:00.000Z',
      endTime: '2025-09-01T23:00:00.000Z',
    },
    location: {
      type: 'venue',
      venue: {
        name: 'Sala Test',
        address1: 'Calle Falsa 123',
        city: 'Madrid',
        country: 'España',
      },
    },
    sponsorship: {
      isLookingForSponsors: true,
      category: 'music',
      sponsorshipStatus: 'open',
      sponsorshipLevel: 'gold',
      budget: { min: 1000, max: 10000 },
      targetAudience: {
        ageRange: { min: 18, max: 35 },
        interests: ['música', 'festivales'],
        expectedAttendees: 2000,
      },
    },
    status: 'published',
  }
}

async function createPublishedEvent(ownerToken, organizerId, overrides = {}) {
  const created = await request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      ...buildEvent(organizerId),
      ...overrides,
    })

  await request(app)
    .patch(`/api/events/${created.body.data._id}/onboarding`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      sponsorship: {
        category: 'music',
        targetAudience: { expectedAttendees: 1000 },
        collaborationTypes: ['financial'],
        budget: { min: 1000, max: 5000 },
        pitch: 'Pitch suficientemente largo para validar onboarding correctamente.',
      },
    })

  return created.body.data._id
}

// ─── POST /api/events ─────────────────────────────────────────────────────────

describe('POST /api/events', () => {
  it('debería crear un evento correctamente', async () => {
    const { token } = await registerAndLogin('creator')
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(buildEvent())

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.name).toBe('Festival Test 2025')
    expect(res.body.data.status).toBe('draft')
  })

  it('debería rechazar si no hay token', async () => {
    const res = await request(app)
      .post('/api/events')
      .send(buildEvent())

    expect(res.status).toBe(401)
  })

  it('debería rechazar si falta la location', async () => {
    const { token } = await registerAndLogin('creator')
    const { location, ...eventWithoutLocation } = buildEvent()
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventWithoutLocation)

    expect(res.status).toBe(400)
  })
})

// ─── GET /api/events ──────────────────────────────────────────────────────────

describe('GET /api/events', () => {
  let token
  beforeEach(async () => {
    const auth = await registerAndLogin('creator')
    token = auth.token

    // Crea 3 eventos publicados buscando sponsors
    for (let i = 0; i < 3; i++) {
      const created = await request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send({
        ...buildEvent(auth.user._id),
        name: `Evento Test ${i + 1}`,
      })
      await request(app)
        .patch(`/api/events/${created.body.data._id}/onboarding`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          sponsorship: {
            category: i === 0 ? 'music' : i === 1 ? 'technology' : 'business',
            targetAudience: { expectedAttendees: (i + 1) * 1000 },
            collaborationTypes: ['financial'],
            budget: { min: (i + 1) * 1000, max: (i + 1) * 5000 },
            pitch: 'Este evento ofrece alta visibilidad para patrocinadores de marca.',
          },
        })
    }

    // Un evento en draft (no debería aparecer en el buscador)
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...buildEvent(),
        name: 'Evento Draft',
      })
  })

  it('debería devolver solo eventos publicados buscando sponsors', async () => {
    const res = await request(app).get('/api/events')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data.length).toBe(3)
    res.body.data.forEach(e => {
      expect(e.status).toBe('published')
      expect(e.sponsorship.isLookingForSponsors).toBe(true)
    })
  })

  it('debería filtrar por categoría', async () => {
    const res = await request(app).get('/api/events?category=music')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].sponsorship.category).toBe('music')
  })

  it('debería filtrar por presupuesto mínimo', async () => {
    const res = await request(app).get('/api/events?minBudget=4000')

    expect(res.status).toBe(200)
    // Solo eventos cuyo max de presupuesto sea >= 4000
    res.body.data.forEach(e => {
      expect(e.sponsorship.budget.max).toBeGreaterThanOrEqual(4000)
    })
  })

  it('debería buscar por texto en el nombre', async () => {
    const res = await request(app).get('/api/events?q=Evento+Test+1')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.data[0].name).toContain('Evento Test 1')
  })

  it('debería ordenar por attendees descendente', async () => {
    const res = await request(app).get('/api/events?sortBy=attendees')

    expect(res.status).toBe(200)
    const attendees = res.body.data.map(e => e.sponsorship.targetAudience.expectedAttendees)
    for (let i = 0; i < attendees.length - 1; i++) {
      expect(attendees[i]).toBeGreaterThanOrEqual(attendees[i + 1])
    }
  })

  it('debería ordenar por presupuesto ascendente', async () => {
    const res = await request(app).get('/api/events?sortBy=budgetAsc')

    expect(res.status).toBe(200)
    const budgets = res.body.data.map(e => e.sponsorship.budget.min)
    for (let i = 0; i < budgets.length - 1; i++) {
      expect(budgets[i]).toBeLessThanOrEqual(budgets[i + 1])
    }
  })

  it('debería paginar correctamente', async () => {
    const res = await request(app).get('/api/events?page=1&limit=2')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(2)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('pages')
    expect(res.body.page).toBe(1)
  })

  it('debería devolver 200 con array vacío si no hay resultados', async () => {
    const res = await request(app).get('/api/events?category=gastronomy')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
  })
})

// ─── GET /api/events/:id ──────────────────────────────────────────────────────

describe('GET /api/events/:id', () => {
  let publishedId
  let draftId
  let ownerToken
  let otherToken

  beforeEach(async () => {
    const owner = await registerAndLogin('creator')
    ownerToken = owner.token
    const other = await registerAndLogin('sponsor')
    otherToken = other.token

    const draft = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(buildEvent())
    draftId = draft.body.data._id

    await request(app)
      .patch(`/api/events/${draftId}/onboarding`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        sponsorship: {
          category: 'music',
          targetAudience: { expectedAttendees: 1000 },
          collaborationTypes: ['financial'],
          budget: { min: 1000, max: 5000 },
          pitch: 'Pitch suficientemente largo para validar onboarding correctamente.',
        },
      })
    publishedId = draftId

    const anotherDraft = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ ...buildEvent(), name: 'Draft privado' })
    draftId = anotherDraft.body.data._id
  })

  it('debería devolver evento published sin auth', async () => {
    const res = await request(app).get(`/api/events/${publishedId}`)

    expect(res.status).toBe(200)
    expect(res.body._id).toBe(publishedId)
    expect(res.body.name).toBe('Festival Test 2025')
  })

  it('debería rechazar draft sin token', async () => {
    const res = await request(app).get(`/api/events/${draftId}`)
    expect(res.status).toBe(401)
  })

  it('debería permitir draft al owner', async () => {
    const res = await request(app)
      .get(`/api/events/${draftId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
    expect(res.status).toBe(200)
  })

  it('debería rechazar draft a usuario no owner', async () => {
    const res = await request(app)
      .get(`/api/events/${draftId}`)
      .set('Authorization', `Bearer ${otherToken}`)
    expect(res.status).toBe(403)
  })

  it('debería devolver 404 si el ID no existe', async () => {
    const res = await request(app).get('/api/events/507f1f77bcf86cd799439099')

    expect(res.status).toBe(404)
  })

  it('debería devolver error si el ID es inválido', async () => {
    const res = await request(app).get('/api/events/id-no-valido')

    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe('GET /api/events/mine', () => {
  it('debería listar eventos del usuario autenticado', async () => {
    const owner = await registerAndLogin('creator')
    await request(app).post('/api/events').set('Authorization', `Bearer ${owner.token}`).send(buildEvent())
    const res = await request(app)
      .get('/api/events/mine')
      .set('Authorization', `Bearer ${owner.token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(1)
  })
})

describe('PATCH /api/events/:id', () => {
  it('debería actualizar el status del evento por su owner', async () => {
    const owner = await registerAndLogin('creator')
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(buildEvent())
    const eventId = created.body.data._id

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'cancelled' })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('cancelled')
  })
})

describe('DELETE /api/events/:id', () => {
  it('debería cancelar evento del owner', async () => {
    const owner = await registerAndLogin('creator')
    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(buildEvent())
    const eventId = created.body.data._id

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${owner.token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('cancelled')
    expect(res.body.data.sponsorship.isLookingForSponsors).toBe(false)
  })
})

describe('GET /api/events/:id/dashboard', () => {
  it('debería devolver dashboard al organizer del evento', async () => {
    const owner = await registerAndLogin('creator')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    const res = await request(app)
      .get(`/api/events/${eventId}/dashboard`)
      .set('Authorization', `Bearer ${owner.token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body.data).toHaveProperty('stats')
    expect(res.body.data.eventInfo.name).toBe('Festival Test 2025')
  })

  it('debería rechazar dashboard para usuario no owner', async () => {
    const owner = await registerAndLogin('creator')
    const other = await registerAndLogin('creator')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    const res = await request(app)
      .get(`/api/events/${eventId}/dashboard`)
      .set('Authorization', `Bearer ${other.token}`)

    expect(res.status).toBe(403)
  })
})

describe('POST /api/events/:id/apply', () => {
  it('debería permitir a un sponsor aplicar a evento publicado', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    const res = await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Nos encaja este evento y queremos patrocinarlo.' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('debería rechazar aplicación duplicada del mismo sponsor', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Primera solicitud' })

    const duplicated = await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Segunda solicitud' })

    expect(duplicated.status).toBe(409)
    expect(duplicated.text).toBe('ALREADY_APPLIED')
  })

  it('debería rechazar si aplica un creator', async () => {
    const owner = await registerAndLogin('creator')
    const creator = await registerAndLogin('creator')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    const res = await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${creator.token}`)
      .send({ message: 'Quiero aplicar' })

    expect(res.status).toBe(403)
  })
})

describe('GET /api/events/inbox', () => {
  it('debería devolver solicitudes para un creator', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para el inbox del creator.' })

    const res = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${owner.token}`)

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.data[0].eventId).toBe(eventId)
    expect(res.body.data[0].sponsor).toHaveProperty('id')
  })

  it('debería devolver aplicaciones del sponsor sin contacto cuando está pending', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para inbox sponsor.' })

    const res = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${sponsor.token}`)

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.data[0].status).toBe('pending')
    expect(res.body.data[0].creatorContact).toBeNull()
  })
})

describe('PATCH /api/events/:id/applications/:appId', () => {
  it('debería aceptar una aplicación y devolver contacto del sponsor', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para ser aprobada.' })

    const creatorInbox = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${owner.token}`)
    const appId = creatorInbox.body.data[0].applicationId

    const res = await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('accepted')
    expect(res.body.sponsorContact).toHaveProperty('email')
  })

  it('debería rechazar actualización si el usuario no es creator', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para prueba de permisos.' })

    const creatorInbox = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${owner.token}`)
    const appId = creatorInbox.body.data[0].applicationId

    const res = await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(403)
  })

  it('debería devolver 404 si el evento no existe', async () => {
    const owner = await registerAndLogin('creator')

    const res = await request(app)
      .patch('/api/events/507f1f77bcf86cd799439099/applications/507f1f77bcf86cd799439098')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(404)
    expect(res.text).toBe('EVENT_NOT_FOUND')
  })

  it('debería devolver 400 si el event id tiene formato inválido', async () => {
    const owner = await registerAndLogin('creator')

    const res = await request(app)
      .patch('/api/events/123/applications/507f1f77bcf86cd799439098')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(400)
    expect(res.text).toBe('INVALID_EVENT_ID')
  })

  it('debería devolver 400 si el appId tiene formato inválido', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para validar appId inválido.' })

    const res = await request(app)
      .patch(`/api/events/${eventId}/applications/123`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(400)
    expect(res.text).toBe('INVALID_APPLICATION_ID')
  })

  it('debería rechazar accepted cuando la aplicación ya está rejected', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para test de transición inválida.' })

    const creatorInbox = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${owner.token}`)
    const appId = creatorInbox.body.data[0].applicationId

    await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'rejected' })

    const res = await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    expect(res.status).toBe(400)
    expect(res.text).toBe('APPLICATION_ALREADY_PROCESSED')
  })

  it('debería rechazar rejected cuando la aplicación ya está accepted', async () => {
    const owner = await registerAndLogin('creator')
    const sponsor = await registerAndLogin('sponsor')
    const eventId = await createPublishedEvent(owner.token, owner.user._id)

    await request(app)
      .post(`/api/events/${eventId}/apply`)
      .set('Authorization', `Bearer ${sponsor.token}`)
      .send({ message: 'Aplicación para transición accepted->rejected.' })

    const creatorInbox = await request(app)
      .get('/api/events/inbox')
      .set('Authorization', `Bearer ${owner.token}`)
    const appId = creatorInbox.body.data[0].applicationId

    await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'accepted' })

    const res = await request(app)
      .patch(`/api/events/${eventId}/applications/${appId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'rejected' })

    expect(res.status).toBe(400)
    expect(res.text).toBe('APPLICATION_ALREADY_PROCESSED')
  })
})
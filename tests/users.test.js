const request = require('supertest')
const app = require('./helpers/app')
const { connect, disconnect, clearDatabase } = require('./helpers/db')

beforeAll(async () => await connect())
afterEach(async () => await clearDatabase())
afterAll(async () => await disconnect())

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createUser(role = 'sponsor', suffix = '') {
  const email = `${role}${suffix}@test.com`
  const password = 'password123'
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email, password, role })
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
  return { token: login.body.token, user: reg.body.user, email }
}

const sponsorOnboarding = {
  sponsorProfile: {
    companyName: 'Acme Corp',
    industry: 'tech',
    companySize: 'startup',
    sponsorshipObjective: 'brand_awareness',
    contributionType: 'money',
    geographicScope: 'national',
    brandValues: ['innovación', 'sostenibilidad'],
    budget: { min: 1000, max: 10000 },
    preferences: {
      eventTypes: ['conference', 'networking'],
      targetAudience: {
        ageRange: { min: 18, max: 40 },
        location: 'Madrid',
        interests: ['tech', 'startups'],
      },
    },
  },
}

// ─── GET /api/users ───────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  it('debería rechazar si no hay token', async () => {
    const res = await request(app).get('/api/users')

    expect(res.status).toBe(401)
  })

  it('debería devolver lista vacía si no hay usuarios', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0]).not.toHaveProperty('password')
  })

  it('debería devolver todos los usuarios registrados', async () => {
    const { token } = await createUser('sponsor', '1')
    await createUser('creator', '2')

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(2)
    res.body.forEach((user) => {
      expect(user).not.toHaveProperty('password')
    })
  })
})

// ─── GET /api/users/me ────────────────────────────────────────────────────────

describe('GET /api/users/me', () => {
  it('debería devolver el usuario autenticado', async () => {
    const { token, email } = await createUser('sponsor')
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(email)
    expect(res.body).not.toHaveProperty('password')
  })

  it('debería rechazar sin token', async () => {
    const res = await request(app).get('/api/users/me')
    expect(res.status).toBe(401)
  })
})

// ─── PATCH /api/users/me ──────────────────────────────────────────────────────

describe('PATCH /api/users/me', () => {
  it('debería actualizar el nombre del usuario autenticado', async () => {
    const { token } = await createUser('creator')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ivan' })

    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe('Ivan')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('debería rechazar payload vacío', async () => {
    const { token } = await createUser('creator')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(400)
  })

  it('debería rechazar sponsorProfile si el usuario es creator', async () => {
    const { token } = await createUser('creator')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sponsorProfile: {
          companyName: 'Acme',
        },
      })

    expect(res.status).toBe(400)
    expect(res.text).toBe('SPONSOR_PROFILE_NOT_ALLOWED_FOR_CREATOR')
  })

  it('debería rechazar creatorProfile si el usuario es sponsor', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        creatorProfile: {
          firstName: 'Ivan',
        },
      })

    expect(res.status).toBe(400)
    expect(res.text).toBe('CREATOR_PROFILE_NOT_ALLOWED_FOR_SPONSOR')
  })

  it('debería permitir a sponsor actualizar sus preferences', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sponsorProfile: {
          preferences: {
            eventTypes: ['conference', 'networking'],
            targetAudience: {
              location: 'Barcelona',
              interests: ['tech', 'ai'],
            },
          },
        },
      })

    expect(res.status).toBe(200)
    expect(res.body.user.sponsorProfile.preferences.eventTypes).toEqual([
      'conference',
      'networking',
    ])
    expect(res.body.user.sponsorProfile.preferences.targetAudience.location).toBe('Barcelona')
    expect(res.body.user.sponsorProfile.preferences.targetAudience.interests).toEqual(['tech', 'ai'])
  })

  it('debería rechazar budget cuando min es mayor que max', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sponsorProfile: {
          budget: {
            min: 5000,
            max: 1000,
          },
        },
      })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
  })
})

// ─── DELETE /api/users/me ─────────────────────────────────────────────────────

describe('DELETE /api/users/me', () => {
  it('debería desactivar al usuario autenticado', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.isActive).toBe(false)
  })
})

// ─── GET /api/users/:id ───────────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  it('debería devolver un usuario por su ID', async () => {
    // Registrar usuario y obtener su ID desde la lista
    const { token } = await createUser('sponsor')
    const list = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
    const userId = list.body[0]._id

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body._id).toBe(userId)
    expect(res.body).toHaveProperty('email')
    expect(res.body).not.toHaveProperty('password')
  })

  it('debería devolver 404 si el ID no existe', async () => {
    const { token } = await createUser('sponsor')
    const res = await request(app)
      .get('/api/users/507f1f77bcf86cd799439099')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/users/onboarding ─────────────────────────────────────────────

describe('PATCH /api/users/onboarding', () => {
  it('debería completar el onboarding de un sponsor', async () => {
    const { token } = await createUser('sponsor')

    const res = await request(app)
      .patch('/api/users/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send(sponsorOnboarding)

    expect(res.status).toBe(200)
    expect(res.body.user.onboardingCompleted).toBe(true)
    expect(res.body.user.sponsorProfile.companyName).toBe('Acme Corp')
  })

  it('debería rechazar si no hay token (401)', async () => {
    const res = await request(app)
      .patch('/api/users/onboarding')
      .send(sponsorOnboarding)

    expect(res.status).toBe(401)
  })

  it('debería rechazar si el token es inválido (401)', async () => {
    const res = await request(app)
      .patch('/api/users/onboarding')
      .set('Authorization', 'Bearer token.falso.aqui')
      .send(sponsorOnboarding)

    expect(res.status).toBe(401)
  })

  it('debería rechazar si faltan campos obligatorios del onboarding sponsor', async () => {
    const { token } = await createUser('sponsor')

    const res = await request(app)
      .patch('/api/users/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({ sponsorProfile: { companyName: 'Solo nombre' } }) // faltan campos

    expect(res.status).toBe(400)
  })

  it('debería rechazar si la industry no es válida', async () => {
    const { token } = await createUser('sponsor')

    const res = await request(app)
      .patch('/api/users/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        sponsorProfile: {
          ...sponsorOnboarding.sponsorProfile,
          industry: 'invalid_industry',
        },
      })

    expect(res.status).toBe(400)
  })

})
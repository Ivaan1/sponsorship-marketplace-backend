import request from 'supertest'
import app from './helpers/app.js'
import { connect, disconnect, clearDatabase } from './helpers/db.js'
 
beforeAll(async () => await connect())
afterEach(async () => await clearDatabase())
afterAll(async () => await disconnect())
 
 
const validSponsor = {
  email: 'sponsor@test.com',
  password: 'password123',
  role: 'sponsor',
}
 
const validCreator = {
  email: 'creator@test.com',
  password: 'password123',
  role: 'creator',
}
 
const expectValidationError = (res, field) => {
  expect(res.status).toBe(400)
  expect(res.body).toHaveProperty('errors')
  expect(Array.isArray(res.body.errors)).toBe(true)
  expect(res.body.errors.length).toBeGreaterThan(0)

  if (field) {
    expect(res.body.errors.some((err) => err.field === field)).toBe(true)
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
 
describe('POST /api/auth/register', () => {
  it('debería registrar un sponsor correctamente y devolver token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validSponsor)
 
    expect(res.status).toBe(201)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
    expect(res.body.user).toMatchObject({
      email: validSponsor.email,
      role: 'sponsor',
    })
    expect(res.body.user).not.toHaveProperty('password')
  })
 
  it('debería registrar un creator correctamente y devolver token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validCreator)
 
    expect(res.status).toBe(201)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
    expect(res.body.user.role).toBe('creator')
    expect(res.body.user).not.toHaveProperty('password')
  })
 
  it('debería rechazar si el email ya existe', async () => {
    await request(app).post('/api/auth/register').send(validSponsor)
    const res = await request(app).post('/api/auth/register').send(validSponsor)
 
    expect(res.status).toBe(400)
    expect(res.text).toBe('USER_ALREADY_EXISTS')
  })
 
  it('debería rechazar si el email es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validSponsor, email: 'no-es-un-email' })
 
    expectValidationError(res, 'email')
  })
 
  it('debería rechazar si la contraseña tiene menos de 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validSponsor, password: '123' })
 
    expectValidationError(res, 'password')
  })
 
  it('debería rechazar si el rol no es válido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validSponsor, role: 'admin' })
 
    expectValidationError(res, 'role')
  })
 
  it('debería rechazar si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'solo@email.com' })
 
    expectValidationError(res)
  })
})
 
// ─── POST /api/auth/login ─────────────────────────────────────────────────────
 
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Crea un usuario antes de cada test de login
    await request(app).post('/api/auth/register').send(validSponsor)
  })
 
  it('debería hacer login correctamente y devolver token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validSponsor.email, password: validSponsor.password })
 
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
    expect(res.body.user).toMatchObject({
      email: validSponsor.email,
      role: 'sponsor',
    })
    expect(res.body.user).not.toHaveProperty('password')
  })
 
  it('debería rechazar con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validSponsor.email, password: 'wrongpassword' })
 
    expect(res.status).toBe(401)
    expect(res.text).toBe('INVALID_PASSWORD')
  })
 
  it('debería rechazar si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'password123' })
 
    expect(res.status).toBe(404)
    expect(res.text).toBe('USER_NOT_FOUND')
  })
 
  it('debería rechazar si falta la contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validSponsor.email })
 
    expectValidationError(res, 'password')
  })
 
  it('debería ser case-insensitive en el email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'SPONSOR@TEST.COM', password: validSponsor.password })
 
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
  })
})
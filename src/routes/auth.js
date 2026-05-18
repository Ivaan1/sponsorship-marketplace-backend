import express from 'express'
import validateSchema from '../middlewares/validator.js'


import { registerUser, loginUser } from '../controllers/auth.js'
import { registerSchema, loginSchema } from '../validators/auth.js'
import { authLimiter } from '../middlewares/rateLimiter.js'

const router = express.Router()

router.post('/register', authLimiter, validateSchema(registerSchema), registerUser); // Endpoint real de registro, con validación

router.post('/login', authLimiter, validateSchema(loginSchema), loginUser); // Endpoint real de login, con validación
/*

## Flujo completo
```
POST /register → crea user → devuelve token → onboardingCompleted: false
       ↓
Front muestra pantalla de onboarding
       ↓
PATCH /users/onboarding → actualiza user → onboardingCompleted: true
       ↓
Front redirige al dashboard

*/
export default router
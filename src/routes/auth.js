const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');


const { registerUser, loginUser } = require('../controllers/auth');
const { registerSchema, loginSchema } = require('../validators/auth');

router.post('/register', validateSchema(registerSchema), registerUser); // Endpoint real de registro, con validación

router.post('/login', validateSchema(loginSchema), loginUser); // Endpoint real de login, con validación
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
module.exports = router;
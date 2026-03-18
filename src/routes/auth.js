const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');


const { createUser, registerUser } = require('../controllers/auth');
const { registerSchema } = require('../validators/auth');


router.post('/register-test', validateSchema(registerSchema), createUser); // Borrar luego, solo para probar la base de datos

router.post('/register', validateSchema(registerSchema), registerUser); // Endpoint real de registro, con validación
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
const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');


const { createUser } = require('../controllers/auth');
const { registerSchema } = require('../validators/auth');


router.post('/register', validateSchema(registerSchema), createUser); // Borrar luego, solo para probar la base de datos

module.exports = router;
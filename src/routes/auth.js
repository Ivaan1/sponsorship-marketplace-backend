const express = require('express');
const router = express.Router();

const { createUser } = require('../controllers/auth');

router.post('/register', createUser); // Borrar luego, solo para probar la base de datos

module.exports = router;
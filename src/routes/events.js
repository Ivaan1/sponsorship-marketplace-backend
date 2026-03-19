const express = require('express');
const router = express.Router();

const { createEvent } = require('../controllers/events');

const { getEvent } = require('../controllers/events');

router.post('/', createEvent); 

router.get('/', getEvent); 

module.exports = router;
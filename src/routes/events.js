const express = require('express');
const router = express.Router();

const { createEvent } = require('../controllers/events');

const { getEvent,getEventById,getEventByName } = require('../controllers/events');

router.post('/', createEvent); 

router.get('/', getEvent);

router.get('/id/:id',getEventById);

router.get('/name/:name',getEventByName);

module.exports = router;
const express = require('express');
const router = express.Router();

const { getUsers,getUserById,getUserByName } = require('../controllers/users');

router.get('/', getUsers);

router.get('/name/:name',getUserByName);

router.get('/id/:id',getUserById);

module.exports = router;
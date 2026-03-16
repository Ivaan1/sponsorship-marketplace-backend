const { eventsModel } = require('../models');
const { handleHttpError } = require('../utils/handleErrors');


async function createEvent(req, res) { // solo para pruebas, luego se eliminará
    try {
        const { body } = req;
        const data = await eventsModel.create(body);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creando el evento:', error);
        handleHttpError(res, error);
    }   
}

module.exports = {
    createEvent,
}
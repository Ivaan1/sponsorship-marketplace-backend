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

const getEvent = async (req, res) => {
  const event = await eventsModel.find();
  res.json(event);
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventsModel.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.json(event);
  } catch (error) {
    handleHttpError(res, error);
  }
};

const getEventByName = async (req, res) => {
  try {
    const { name } = req.params;
    const event = await eventsModel.findOne({ name });
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.json(event);
  } catch (error) {
    handleHttpError(res, error);
  }
};


module.exports = {
    createEvent,
    getEvent,
    getEventById,
    getEventByName
}
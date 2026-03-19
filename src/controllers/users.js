// este controlador se encarga de manejar operaciones con usuarios
//el login y register se manejan en el controlador de auth.js

const {usersModel} = require("../models");
const { handleHttpError } = require ('../utils/handleErrors')

const getUsers = async (req, res) => {
  try {
    const users = await usersModel.find();
    res.json(users);
  } catch (error) {
     console.error('Error en getUsers:', error);
    handleHttpError(res, error);
  }
};

module.exports = { getUsers };
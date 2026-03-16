// este controlador se encarga de manejar operaciones con usuarios
//el login y register se manejan en el controlador de auth.js

const {usersModel} = require("../models/nosql/users");
const { handleHttpError } = require ('../utils/handleErrors')


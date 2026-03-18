// este controlador se encarga de manejar la autenticación de los usuarios, incluyendo el inicio de sesión y el registro.
const { handleHttpError } = require('../utils/handleErrors');
const { usersModel } = require('../models');
const { tokenSign } = require('../utils/handleJWT.js');

//solo para pruebas, luego se eliminará 
async function createUser(req, res) {
    try {
        const { body } = req;
        const data = await usersModel.create(body);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creando el usuario:', error);
        handleHttpError(res, error);
    }
}

async function registerUser(req, res) {
    try {
        const { password: rawPassword, ...rest } = matchedData(req)
        const password = await encrypt(rawPassword)

        const user = await usersModel.create({ ...rest, password })

        res.status(201).json({
            token: tokenSign(user),
            user,
        })

    } catch (error) {
        console.error('Error registrando el usuario:', error)
        handleHttpError(res, error)
    }
}
module.exports = {
    createUser, 
    registerUser,
}
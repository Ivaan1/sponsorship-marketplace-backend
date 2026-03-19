// este controlador se encarga de manejar la autenticación de los usuarios, incluyendo el inicio de sesión y el registro.
const { handleHttpError } = require('../utils/handleErrors');
const { usersModel } = require('../models');
const { tokenSign } = require('../utils/handleJWT.js');
const { encrypt } = require('../utils/handlePassword');

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
        const { password: rawPassword, ...rest } = req.body;
        const password = await encrypt(rawPassword)

        const user = await usersModel.create({ ...rest, password, })
        const userFiltered = {
            email: user.email,
            role: user.role
        };

        res.status(201).json({
            token: await tokenSign(user), 
            user: userFiltered,           
        });

    } catch (error) {
        if (error.code === 11000) return handleHttpError(res, 'USER_ALREADY_EXISTS', 400);
        console.error('Error registrando el usuario:', error)
        handleHttpError(res, 'ERROR_REGISTER_USER', 500)
    }
}

module.exports = {
    createUser, 
    registerUser,
}
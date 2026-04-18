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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    handleHttpError(res, error);
  }
};

const getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    const user = await usersModel.findOne({ name });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserByName:', error);
    handleHttpError(res, error);
  }
};

const updateOnboarding = async (req, res) => {
    try {
        const userId = req.user._id
        const data = req.body

        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { ...data, onboardingCompleted: true },
            { 
                returnDocument: 'after', 
                runValidators: true   
            }   
        ).select('-password')

        res.json({
            status: "success",
            message: "Perfil de creador actualizado correctamente",
            user: updatedUser
        });
        
        if (!updatedUser) {
            return handleHttpError(res, 'USER_NOT_FOUND', 404)
        }

        res.status(200).json({ user: updatedUser })

    } catch (error) {
        console.error('Error actualizando onboarding:', error)
        handleHttpError(res, 'ERROR_UPDATING_ONBOARDING', 500)
    }
}

module.exports = { getUsers, getUserById, getUserByName, updateOnboarding };
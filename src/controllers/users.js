// este controlador se encarga de manejar operaciones con usuarios
//el login y register se manejan en el controlador de auth.js

const { usersModel } = require("../models");
const { handleHttpError } = require ('../utils/handleErrors')

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

        if (!updatedUser) {
            return handleHttpError(res, 'USER_NOT_FOUND', 404)
        }

        res.status(200).json({ user: updatedUser })

    } catch (error) {
        console.error('Error actualizando onboarding:', error)
        handleHttpError(res, 'ERROR_UPDATING_ONBOARDING', 500)
    }
}

module.exports = {
    updateOnboarding,
}
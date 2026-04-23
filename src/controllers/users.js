// este controlador se encarga de manejar operaciones con usuarios
//el login y register se manejan en el controlador de auth.js

import { usersModel } from '../models/index.js'
import { handleHttpError } from '../utils/handleErrors.js'

const getUsers = async (req, res) => {
  try {
    const users = await usersModel.find().select('-password');
    res.json(users);
  } catch (error) {
     console.error('Error en getUsers:', error);
    handleHttpError(res, error);
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json(req.user)
  } catch (error) {
    console.error('Error en getMe:', error)
    handleHttpError(res, 'ERROR_GET_ME', 500)
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersModel.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    handleHttpError(res, error);
  }
};

const updateMe = async (req, res) => {
  try {
    const userId = req.user._id
    const data = req.body

    if (req.user.role === 'creator' && data.sponsorProfile) {
      return handleHttpError(res, 'SPONSOR_PROFILE_NOT_ALLOWED_FOR_CREATOR', 400)
    }

    if (req.user.role === 'sponsor' && data.creatorProfile) {
      return handleHttpError(res, 'CREATOR_PROFILE_NOT_ALLOWED_FOR_SPONSOR', 400)
    }

    const updatedUser = await usersModel.findByIdAndUpdate(
      userId,
      data,
      {
        returnDocument: 'after',
        runValidators: true
      }
    ).select('-password')

    if (!updatedUser) {
      return handleHttpError(res, 'USER_NOT_FOUND', 404)
    }

    return res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error en updateMe:', error)
    handleHttpError(res, 'ERROR_UPDATING_PROFILE', 500)
  }
}

const deleteMe = async (req, res) => {
  try {
    const userId = req.user._id

    const deletedUser = await usersModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { returnDocument: 'after' }
    ).select('-password')

    if (!deletedUser) {
      return handleHttpError(res, 'USER_NOT_FOUND', 404)
    }

    return res.status(200).json({
      status: 'success',
      message: 'Usuario desactivado correctamente',
      user: deletedUser
    })
  } catch (error) {
    console.error('Error en deleteMe:', error)
    handleHttpError(res, 'ERROR_DELETING_USER', 500)
  }
}

const updateOnboarding = async (req, res) => {
    try {
        const userId = req.user._id
        const data = req.body

        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { 
                ...data, // Aquí entrará 'sponsorProfile' o 'creatorProfile' según el Zod
                onboardingCompleted: true 
            },
            { 
                returnDocument: 'after',
                runValidators: true   
            }   
        ).select('-password');

        if (!updatedUser) {
            return handleHttpError(res, 'USER_NOT_FOUND', 404);
        }

        return res.status(200).json({
            status: "success",
            message: `Perfil de ${req.user.role} actualizado correctamente`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Error actualizando onboarding:', error)
        handleHttpError(res, 'ERROR_UPDATING_ONBOARDING', 500)
    }
}

export { getUsers, getMe, getUserById, updateMe, deleteMe, updateOnboarding }
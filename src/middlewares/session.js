const { usersModel } = require('../models')
const { handleHttpError } = require('../utils/handleErrors')
const { verifyToken } = require('../utils/handleJWT')

async function authMiddleware(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return handleHttpError(res, 'NO_TOKEN_FOUND', 401)
        }

        const token = req.headers.authorization.split(' ').pop()
        const dataToken = await verifyToken(token)

        if (!dataToken?._id) {
            return handleHttpError(res, 'INVALID_TOKEN', 401)
        }

        const user = await usersModel.findById(dataToken._id).select('-password')

        if (!user) {
            return handleHttpError(res, 'USER_NOT_FOUND', 401)
        }

        req.user = user
        next()

    } catch (e) {
        console.error('Auth middleware error:', e)

        if (e.name === 'TokenExpiredError') {
            return handleHttpError(res, 'TOKEN_EXPIRED', 401)
        }

        handleHttpError(res, 'NOT_SESSION', 401)
    }
}

module.exports = authMiddleware
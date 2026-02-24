const handleHttpError = (res, message = 'SERVER_ERROR', code = 500) => {
    res.status(code).send(message)
}
module.exports = { handleHttpError }
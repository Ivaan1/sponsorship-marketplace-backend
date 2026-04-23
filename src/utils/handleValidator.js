import { validationResult } from 'express-validator'
const validateResults = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (err) {
        res.status(422)
        res.send({ errors: err.array()})
    }
}
export default validateResults
const { check } = require("express-validator")
const validateResults = require("../utils/handleValidator")

 const validatorRegister = [
    check("email")
    .exists().withMessage("El correo es obligatorio.")
    .notEmpty().withMessage("El correo no puede estar vacío.")
    .isEmail().withMessage("El correo no tiene un formato válido."),
    check("password")
    .exists().withMessage("La contraseña es obligatoria.")
    .notEmpty().withMessage("La contraseña no puede estar vacía.")
    .isLength({ min: 8, max: 16 }).withMessage("La contraseña debe tener entre 8 y 16 caracteres."),
  
     (req, res, next) => {
         return validateResults(req, res, next)
    }
 ]

 
module.exports = { validatorRegister}
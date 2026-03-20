const { ZodError } = require("zod")

const validateSchema = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    console.error('Validation error:', error)

    if (error instanceof ZodError && Array.isArray(error.errors)) {
      return res.status(400).json({
        errors: error.errors.map((err) => ({
          field: err.path.join(".") || "unknown",
          message: err.message,
        })),
      })
    }

    res.status(400).json({ 
      errors: [{ field: "unknown", message: "Error de validación" }] 
    })
  }
}

module.exports = validateSchema
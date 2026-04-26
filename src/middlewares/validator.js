import { ZodError } from 'zod'

const validateSchema = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Validation error:', error)
    }

    const issues = error?.issues || error?.errors

    if (error instanceof ZodError && Array.isArray(issues)) {
      return res.status(400).json({
        errors: issues.map((err) => ({
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

export default validateSchema
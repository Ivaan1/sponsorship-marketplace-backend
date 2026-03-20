const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Email inválido").trim().toLowerCase(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  role: z.enum(["sponsor", "creator"], {
    errorMap: () => ({ message: "El rol debe ser sponsor o creator" }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

module.exports = { registerSchema, loginSchema };
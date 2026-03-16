const { z } = require("zod");

const INDUSTRIES = ["tech", "food", "fashion", "sports", "music", "finance", "health", "other"];
const EVENT_TYPES = ["concert", "conference", "festival", "sports", "networking", "other"];

const baseSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().trim().email("Formato de email inválido").toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const registerSchema = z.discriminatedUnion("role", [
  
  // CASO SPONSOR
  baseSchema.extend({
    role: z.literal("sponsor"),
    sponsorProfile: z.object({
      companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
      industry: z.enum(INDUSTRIES, {
        errorMap: () => ({ message: "Industria no válida" }),
      }),
      budget: z.object({
        min: z.number().min(0, "El presupuesto no puede ser negativo"),
        max: z.number().min(0),
      }),
      preferences: z.object({
        eventTypes: z.array(z.enum(EVENT_TYPES)),
        targetAudience: z.object({
          ageRange: z.object({
            min: z.number().min(0).max(100),
            max: z.number().min(0).max(100),
          }),
          location: z.string().optional(),
          interests: z.array(z.string()).default([]),
        }),
      }),
    }),
  }),

  // CASO CREATOR
  // analizar el perfil del creador mas adelante
  // por ahora solo validamos el rol y el baseSchema.
  baseSchema.extend({
    role: z.literal("creator"),
  }),
]);

module.exports = { registerSchema };
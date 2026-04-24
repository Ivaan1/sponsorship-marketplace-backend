import { z } from 'zod'

const createEventSchema = z.object({

  name: z.string({ 
    required_error: "El nombre del evento es obligatorio" 
  }).trim().min(3, "El nombre debe tener al menos 3 caracteres"),
  
  summary: z.string()
    .max(140, "El resumen no puede superar los 140 caracteres")
    .optional(),
    
  introduction: z.string().optional(),


  eventType: z.enum(["single", "recurring"], {
    required_error: "Debes especificar si es un evento único ('single') o recurrente ('recurring')"
  }),
  
  // Zod valida las fechas que llegan del Frontend como Strings en formato ISO (ej: "2026-10-15T18:00:00Z")
  singleDate: z.object({
    startTime: z.string().datetime({ message: "Formato de fecha de inicio inválido" }),
    endTime: z.string().datetime({ message: "Formato de fecha de fin inválido" })
  }).optional(),

  location: z.object({
    type: z.enum(["venue", "online", "tba"], {
      required_error: "El tipo de ubicación es obligatorio"
    }),
    
    // Si es "venue" (Físico), el frontend puede mandar estos datos
    venue: z.object({
      name: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    
    // Si es "online", el frontend puede mandar el link
    onlineUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url("Debe ser un enlace válido").optional()
  )

    
  }, { required_error: "La ubicación es obligatoria" }),

  media: z.object({
    images: z.array(z.object({
      url: z.string().url("La URL de la imagen no es válida"),
      format: z.enum(["jpeg", "png"]).optional()
    })).optional()
  }).optional()
});

const onboardingSchema = z.object({

  sponsorship: z.object({
    
    // ── 1. Categoría (Obligatorio) ──
    category: z.enum([
      "music", "technology", "gastronomy", "culture", "business", 
      "health", "education", "entertainment", "concert", 
      "conference", "festival", "sports", "networking", "other"
    ], { 
      required_error: "Debes seleccionar una categoría para tu evento",
      invalid_type_error: "Categoría no válida" 
    }),

    // ── 2. Público / Aforo (Obligatorio) ──
    targetAudience: z.object({
      expectedAttendees: z.number({ 
        required_error: "Debes indicar la cantidad de público esperado",
        invalid_type_error: "El público debe ser un número"
      }).min(1, "Debe haber al menos 1 asistente")
    }, { required_error: "La información de la audiencia es obligatoria" }),

    digitalReach: z.object({
      estimatedOnlineViewers: z.number().min(0).optional()
    }).optional(),

    // ── 3. Tipo de patrocinio (Obligatorio: mínimo 1) ──
    collaborationTypes: z.array(
      z.enum(["financial", "services", "brand_collaboration", "other"])
    ).min(1, "Debes seleccionar al menos un tipo de patrocinio que buscas"),

    // ── 4. Presupuesto aproximado (Obligatorio) ──
    budget: z.object({
      min: z.number({ required_error: "El presupuesto mínimo es obligatorio" }).min(0),
      max: z.number({ required_error: "El presupuesto máximo es obligatorio" }).min(0)
    }, { required_error: "El rango de presupuesto es obligatorio" }),

    // ── 5. Propuesta de patrocinio (Obligatorio) ──
    pitch: z.string({ 
      required_error: "La propuesta de patrocinio es obligatoria" 
    })
    .trim()
    .min(30, "El pitch es muy corto, cuéntale un poco más a las marcas (min. 30 caracteres)")
    .max(1500, "La propuesta es demasiado larga (máximo 1500 caracteres)"),

    // ── 6. Redes sociales (Opcional, pero validadas si las mandan) ──
    socialLinks: z.object({
      whatsapp: z.string().trim().optional(),
      instagram: z.string().trim().optional(),
      youtube: z.string().trim().optional()
    }).optional()

  }, { 
    required_error: "El bloque de sponsorship es obligatorio para el onboarding" 
  })
});

const updateEventSchema = z.object({
  name: z.string().trim().min(3).optional(),
  summary: z.string().max(140).optional(),
  introduction: z.string().optional(),
  location: z.object({
    type: z.enum(["venue", "online", "tba"]).optional(),
    venue: z.object({
      name: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    onlineUrl: z.preprocess((val) => (val === '' ? undefined : val),z.string().url("Debe ser un enlace válido").optional())
  }, { required_error: "La ubicación es obligatoria" }).optional(),
  status: z.enum(["draft", "published", "cancelled", "finished"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un campo para actualizar',
})

const applyEventSchema = z.object({
    message: z.string({
      required_error: "El mensaje de motivación es obligatorio",
    }).min(1, "El mensaje no puede estar vacío"),
});

const updateApplicationSchema = z.object({
  status: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: "El estado debe ser 'accepted' o 'rejected'" }),
  }),
});

export { createEventSchema, onboardingSchema, updateEventSchema, applyEventSchema, updateApplicationSchema }
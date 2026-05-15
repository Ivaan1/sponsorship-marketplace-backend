import { z } from 'zod'

const updateMeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  profilePicture: z.string().url().optional(),
    bio: z.string().max(500, 'La biografía no puede exceder los 500 caracteres').optional(),
    location: z.object({
        city: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
  sponsorProfile: z.object({
    companyName: z.string().min(2).optional(),
    industry: z.enum(['tech', 'food', 'fashion', 'sports', 'music', 'finance', 'health', 'other']).optional(),
    companySize: z.enum(['startup', 'pyme', 'enterprise']).optional(),
    sponsorshipObjective: z.enum(['brand_awareness', 'lead_generation', 'pr_networking', 'csr']).optional(),
    contributionType: z.enum(['money', 'services', 'in_kind', 'mixed']).optional(),
    geographicScope: z.enum(['local', 'regional', 'national', 'international']).optional(),
    brandValues: z.array(z.string()).min(1, 'Debe tener al menos un valor de marca').optional(),
    budget: z.object({
      min: z.number().nonnegative().optional(),
      max: z.number().nonnegative().optional(),
    }).refine((budget) => {
      if (budget.min === undefined || budget.max === undefined) return true
      return budget.min <= budget.max
    }, {
      message: 'El presupuesto mínimo no puede ser mayor que el máximo',
    }).optional(),
    preferences: z.object({
      eventTypes: z.array(z.enum(['concert', 'conference', 'festival', 'sports', 'networking', 'other'])).optional(),
      targetAudience: z.object({
        ageRange: z.object({
          min: z.number().min(0).max(100).optional(),
          max: z.number().min(0).max(100).optional(),
        }).optional(),
        location: z.string().min(2).optional(),
        interests: z.array(z.string()).optional(),
      }).optional(),
    }).optional(),
  }).optional(),
  creatorProfile: z.object({
    contactEmail: z.string().email().optional(),
  }).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un campo para actualizar',
})

export { updateMeSchema }

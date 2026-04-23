import { z } from 'zod'

const sponsorOnboardingSchema = z.object({
  sponsorProfile: z.object({
    companyName: z.string().min(2),
    industry: z.enum(["tech", "food", "fashion", "sports", "music", "finance", "health", "other"]),
    companySize: z.enum(["startup", "pyme", "enterprise"]),
    sponsorshipObjective: z.enum(["brand_awareness", "lead_generation", "pr_networking", "csr"]),
    contributionType: z.enum(["money", "services", "in_kind", "mixed"]),
    geographicScope: z.enum(["local", "regional", "national", "international"]),
    brandValues: z.array(z.string()).min(1, "Debe tener al menos un valor de marca"),
    budget: z.object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative()
    }),
    preferences: z.object({
      eventTypes: z.array(z.enum(["concert", "conference", "festival", "sports", "networking", "other"])),
      targetAudience: z.object({
        ageRange: z.object({
          min: z.number().min(0).max(100),
          max: z.number().min(0).max(100),
        }),
        location: z.string().min(2),
        interests: z.array(z.string()),
      }),
    }),
  }),
});


export { sponsorOnboardingSchema }
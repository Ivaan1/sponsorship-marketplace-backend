const { z } = require("zod");

const sponsorOnboardingSchema = z.object({
  sponsorProfile: z.object({
    companyName: z.string().min(2),
    industry: z.enum(["tech", "food", "fashion", "sports", "music", "finance", "health", "other"]),
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

// Para este MVP, el onboarding de creators es muy simple. Se puede expandir en el futuro.
const creatorOnboardingSchema = z.object({
    creatorProfile: z.object({}).passthrough() 
});

module.exports = { sponsorOnboardingSchema, creatorOnboardingSchema };
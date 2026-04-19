const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["sponsor", "creator"],
      required: true,
    },

    // Solo relevante si role === "sponsor"
    sponsorProfile: {
      companyName: { type: String },
      industry: {
        type: String,
        enum: ["tech", "food", "fashion", "sports", "music", "finance", "health", "other"],
      },
      companySize: {
        type: String,
        enum: ["startup", "pyme", "enterprise"],
      },
      sponsorshipObjective: {
        type: String,
        enum: ["brand_awareness", "lead_generation", "pr_networking", "csr"],
      },
      contributionType: {
        type: String,
        enum: ["money", "services", "in_kind", "mixed"],
      },
      geographicScope: {
        type: String,
        enum: ["local", "regional", "national", "international"],
      },
      brandValues: [{ type: String }],
      budget: {
        min: { type: Number },
        max: { type: Number },
      },
      preferences: {
        eventTypes: [{ type: String, enum: ["concert", "conference", "festival", "sports", "networking", "other"] }],
        targetAudience: {
          ageRange: {
            min: { type: Number, min: 0, max: 100 },
            max: { type: Number, min: 0, max: 100 },
          },
          location: { type: String },
          interests: [{ type: String }],
        },
      },
    },

    // Solo relevante si role === "creator"
    creatorProfile: {
      firstName: { type: String },
      lastName: { type: String },
      location: { type: String },
      company: { type: String },
      position: { type: String }, // Cargo
      profileImage: { type: String },
      onboardingCompleted: { type: Boolean, default: false }
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    onboardingCompleted: { type: Boolean, default: false }
  
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
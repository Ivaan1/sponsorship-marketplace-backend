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
      enum: ["sponsor", "organizer"],
      required: true,
    },

    // Solo relevante si role === "sponsor"
    sponsorProfile: {
      companyName: { type: String },
      industry: {
        type: String,
        enum: ["tech", "food", "fashion", "sports", "music", "finance", "health", "other"],
      },
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

    // Solo relevante si role === "organizer"
    organizerProfile: {
      organization: { type: String },
      website: { type: String },
      eventsHosted: { type: Number, default: 0 },
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", userSchema);
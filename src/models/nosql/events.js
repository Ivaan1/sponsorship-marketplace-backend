const mongoose = require("mongoose");

// --- Sub-schemas ---

const mediaSchema = new mongoose.Schema({
  images: [{
    url: { type: String },
    size: { type: Number }, // en bytes
    format: { type: String, enum: ["jpeg", "png"] }
  }],
  video: {
    url: { type: String },
    format: { type: String, enum: ["mp4", "mov"] },
    duration: { type: Number }, // en segundos, max 60
    resolution: { type: String } // ej: "1080p"
  }
});

const scheduleSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

const recurrenceSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ["once", "daily", "weekly", "monthly"],
    required: true,
  },
  until: { type: Date },           // fecha fin de recurrencia
  dayOfWeek: { type: String },     // ej: "wednesday" si es weekly
  dayOfMonth: { type: Number },    // ej: 5 si es mensual el día 5
  schedules: [scheduleSchema],     // lista de bloques horarios
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["venue", "online", "tba"], // tba = to be announced
    required: true,
  },
  venue: {
    name: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  onlineUrl: { type: String },
});

const castMemberSchema = new mongoose.Schema({
  image: { type: String },         // 320x320px
  name: { type: String, required: true },
  description: { type: String },
  isHeadliner: { type: Boolean, default: false },
  socialLinks: {
    instagram: { type: String },
    twitter: { type: String },
    facebook: { type: String },
    website: { type: String },
  }
});

const agendaItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  hostOrArtist: { type: String },
  description: { type: String },
});

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["paid", "free", "donation"],
    required: true,
  },
  price: { type: Number, default: 0 },
  availableQuantity: { type: Number },
  saleEnds: {
    reference: { type: String, enum: ["before_event", "before_start"] },
    amount: { type: Number },
    unit: { type: String, enum: ["minutes", "hours", "days"] },
  },
  advanced: {
    description: { type: String },
    visibility: { type: String, enum: ["public", "hidden"], default: "public" },
    ticketsPerOrder: { type: Number },
    delivery: {
      online: { type: Boolean, default: false },
      door: { type: Boolean, default: false },
    },
    electronicTicket: { type: Boolean, default: true },
    inPersonPickup: { type: Boolean, default: false },
  }
});

// --- Main Schema ---

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    // Básico
    name: { type: String, required: true, trim: true },
    summary: { type: String, maxlength: 140 },
    introduction: { type: String }, // markdown/rich text

    // Media
    media: { type: mediaSchema },

    // Fecha y recurrencia
    eventType: {
      type: String,
      enum: ["single", "recurring"],
      required: true,
    },
    singleDate: { type: scheduleSchema },   // si eventType === "single"
    recurrence: { type: recurrenceSchema }, // si eventType === "recurring"

    // Ubicación
    location: { type: locationSchema, required: true },

    // Información útil
    usefulInfo: {
      highlights: {
        ageRestriction: {
          type: String,
          enum: ["all_ages", "+12", "+16", "+18", "+21", "guardian_under_14", "guardian_under_16", "guardian_under_18", "guardian_under_21"],
          default: "all_ages",
        },
        parking: {
          type: String,
          enum: ["free", "paid", "none"],
        },
      },
      faq: [{
        question: { type: String },
        answer: { type: String },
      }],
    },

    // Elenco
    cast: [castMemberSchema],

    // Agenda
    agenda: [[agendaItemSchema]], // array de arrays para múltiples fechas

    // Entradas
    tickets: [ticketSchema],

    // Nuestros campos para el marketplace de sponsors
    sponsorship: {
      isLookingForSponsors: { type: Boolean, default: false },
      budget: {
        min: { type: Number },
        max: { type: Number },
      },
      targetAudience: {
        ageRange: {
          min: { type: Number },
          max: { type: Number },
        },
        interests: [{ type: String }],
        expectedAttendees: { type: Number },
      },
      perks: [{ type: String }], // ej: ["logo en banner", "stand propio", "mención en redes"]
      category: {
        type: String,
        enum: ["concert", "conference", "festival", "sports", "networking", "other"],
      },
      sponsorsApplied: [{
        sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        message: { type: String },
        appliedAt: { type: Date, default: Date.now },
      }],
    },

    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "finished"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("events", eventSchema); 
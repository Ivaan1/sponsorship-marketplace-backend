import mongoose from 'mongoose'

// --- Sub-schemas ---

const mediaSchema = new mongoose.Schema({
  images: [{
    url: { type: String },
    size: { type: Number },
    format: { type: String, enum: ["jpeg", "png"] }
  }],
  video: {
    url: { type: String },
    format: { type: String, enum: ["mp4", "mov"] },
    duration: { type: Number },
    resolution: { type: String }
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
  until: { type: Date },
  dayOfWeek: { type: String },
  dayOfMonth: { type: Number },
  schedules: [scheduleSchema],
});

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["venue", "online", "tba"],
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
  image: { type: String },
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
  soldQuantity: { type: Number, default: 0 },
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
    introduction: { type: String },

    // Media
    media: { type: mediaSchema },

    // Fecha y recurrencia
    eventType: {
      type: String,
      enum: ["single", "recurring"],
      required: true,
    },
    singleDate: { type: scheduleSchema },
    recurrence: { type: recurrenceSchema },

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
    agenda: [[agendaItemSchema]],

    // Entradas
    tickets: [ticketSchema],

    // ─────────────────────────────────────────────────────────────────────────
    // MARKETPLACE DE SPONSORS
    // ─────────────────────────────────────────────────────────────────────────
    sponsorship: {

      isLookingForSponsors: { type: Boolean, default: false },

      // ── Categoría ─────────────────────────────────────────────────────────
      // Incluye valores nuevos (alineados con UI) + valores legacy de la BD
      // para no romper documentos existentes.
      category: {
        type: String,
        enum: [
          // ── Valores nuevos (UI) ──
          "music",          // Música
          "technology",     // Tecnología
          "gastronomy",     // Gastronomía
          "culture",        // Cultura
          "business",       // Negocios
          "health",         // Salud
          "education",      // Educación
          "entertainment",  // Entretenimiento
          "concert",        // → mapear a "music" en el front
          "conference",     // → mapear a "technology" o "business"
          "festival",       // → mapear a "entertainment"
          "sports",         // → mapear a "health"
          "networking",     // → mapear a "business"
          "other",
        ],
      },

      // ── Presupuesto → filtro "Presupuesto" ────────────────────────────────
      budget: {
        min: { type: Number },
        max: { type: Number },
      },

      // ── Audiencia → filtro "Público" y "Alcance" ──────────────────────────
      targetAudience: {
        ageRange: {
          min: { type: Number },
          max: { type: Number },
        },
        interests: [{ type: String }],
        expectedAttendees: { type: Number },
      },

      // ── Beneficios → tarjeta "#Visibilidad para la marca" ─────────────────
      perks: [{ type: String }],
      collaborationTypes: [{
        type: String,
        enum: ["financial", "services", "brand_collaboration", "other"] // Valores internos para esos botones
      }],
      pitch: {
        type: String,
        trim: true
      },
      socialLinks: {
        whatsapp: { type: String, trim: true },
        instagram: { type: String, trim: true },
        youtube: { type: String, trim: true },
      },

      // ── Nivel de patrocinio → filtro "Nivel" ──────────────────────────────
      // NUEVO — opcional, no rompe documentos sin este campo
      sponsorshipLevel: {
        type: String,
        enum: ["title", "gold", "silver", "bronze", "community"],
      },

      // ── Alcance digital → tarjeta "#Alcance digital del evento" ───────────
      // NUEVO — opcional
      digitalReach: {
        estimatedOnlineViewers: { type: Number },
        streamingPlatforms: [{ type: String }],
        socialMediaImpressions: { type: Number },
        hasLivestream: { type: Boolean, default: false },
      },

      // ── Patrocinadores anteriores → tarjeta "#Patrocinadores anteriores" ──
      // NUEVO — opcional
      previousSponsors: [{
        name: { type: String },
        logoUrl: { type: String },
        year: { type: Number },
      }],

      // ── Estado del patrocinio → filtro "Estado" ───────────────────────────
      // NUEVO — opcional, default "open"
      sponsorshipStatus: {
        type: String,
        enum: ["open", "closed", "in_negotiation"],
        default: "open",
      },

      // ── Solicitudes de sponsors ───────────────────────────────────────────
      sponsorsApplied: [{
        sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        message: { type: String },
        appliedAt: { type: Date, default: Date.now },
      }],

      // ── Alcance geográfico → filtro "Alcance" ──
      geographicScope: {
        type: String,
        enum: ["local", "regional", "national", "international"],
      },
    },

    status: { 
      type: String,
      enum: ["draft", "published", "cancelled", "finished"],
      default: "draft",
    },
    analytics: {
        views: { type: Number, default: 0 }
    },
  },
  { timestamps: true }
);

export default mongoose.model('events', eventSchema)
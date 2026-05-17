// src/services/eventRankService.js
// SQUAD: Squad-Back / Motor de búsqueda modifica el orden en el que se muestran los eventos 
// a los sponsors, basándose en la relevancia de cada evento para el sponsor.

class EventRankService {
  // ── Mapa de categorías legacy → nuevas ───────────────────────────────────────
  // Propiedad estática privada para encapsular el diccionario de categorías
  static #LEGACY_CATEGORY_MAP = {
    concert:     'music',
    festival:    'entertainment',
    conference:  'technology',
    sports:      'health',
    networking:  'business',
    other:       'other',
  };

  /**
   * Normaliza una categoría legacy al nuevo sistema.
   * Si ya es un valor nuevo, la devuelve tal cual.
   */
  static normalizeCategory(category) {
    if (!category) return null;
    return this.#LEGACY_CATEGORY_MAP[category] ?? category;
  }

  /**
   * Calcula la puntuación de relevancia de un evento para un sponsor (0–100).
   */
  static scoreEvent(event, sponsor, maxAttendees = 1) {
    let score = 0;
    const sp = event.sponsorship;

    if (!sp) return 0;

    // ── 1. CATEGORÍA (30 pts) ─────────────────────────────────────────────────
    const eventCategory   = this.normalizeCategory(sp.category);
    const spEventTypes    = sponsor?.sponsorProfile?.preferences?.eventTypes ?? [];
    const spNormalized    = spEventTypes.map(cat => this.normalizeCategory(cat));

    if (spNormalized.length && eventCategory && spNormalized.includes(eventCategory)) {
      score += 30;
    }

    // ── 2. PRESUPUESTO (25 pts) ───────────────────────────────────────────────
    const eventMin = sp.budget?.min ?? 0;
    const eventMax = sp.budget?.max ?? Infinity;
    const spMin    = sponsor?.sponsorProfile?.budget?.min ?? 0;
    const spMax    = sponsor?.sponsorProfile?.budget?.max ?? Infinity;

    const overlap  = Math.min(eventMax, spMax) - Math.max(eventMin, spMin);
    if (overlap > 0) {
      const eventRange   = (eventMax - eventMin) || 1;
      const overlapRatio = overlap / eventRange;
      if (overlapRatio >= 0.8)      score += 25;
      else if (overlapRatio >= 0.4) score += 15;
      else                          score += 8;
    }

    // ── 3. RANGO DE EDAD (20 pts) ─────────────────────────────────────────────
    const eventAgeMin = sp.targetAudience?.ageRange?.min ?? 0;
    const eventAgeMax = sp.targetAudience?.ageRange?.max ?? 100;
    const spAgeMin    = sponsor?.sponsorProfile?.preferences?.targetAudience?.ageRange?.min ?? 0;
    const spAgeMax    = sponsor?.sponsorProfile?.preferences?.targetAudience?.ageRange?.max ?? 100;

    const ageOverlap  = Math.min(eventAgeMax, spAgeMax) - Math.max(eventAgeMin, spAgeMin);
    if (ageOverlap > 0) {
      const ageRange  = (eventAgeMax - eventAgeMin) || 1;
      const ageRatio  = ageOverlap / ageRange;
      if (ageRatio >= 0.8)      score += 20;
      else if (ageRatio >= 0.4) score += 12;
      else                      score += 5;
    }

    // ── 4. ASISTENTES ESPERADOS (15 pts) ──────────────────────────────────────
    const attendees = sp.targetAudience?.expectedAttendees ?? 0;
    if (maxAttendees > 0) {
      score += Math.round((attendees / maxAttendees) * 15);
    }

    // ── 5. INTERESES COMUNES (10 pts) ─────────────────────────────────────────
    const eventInterests = sp.targetAudience?.interests ?? [];
    const spInterests    = sponsor?.sponsorProfile?.preferences?.targetAudience?.interests ?? [];

    if (eventInterests.length && spInterests.length) {
      const common = eventInterests.filter(i =>
        spInterests.map(s => s.toLowerCase()).includes(i.toLowerCase())
      ).length;
      score += Math.min(common * 2, 10);
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Ordena un array de eventos por relevancia para un sponsor.
   */
  static rankEvents(events, sponsor = null) {
    if (!events?.length) return [];

    const maxAttendees = Math.max(
      ...events.map(e => e.sponsorship?.targetAudience?.expectedAttendees ?? 0),
      1
    );

    return events
      .map(event => ({
        ...event,
        _score: this.scoreEvent(event, sponsor, maxAttendees),
      }))
      .sort((a, b) => b._score - a._score);
  }
}

export default EventRankService;
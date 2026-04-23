// src/utils/rankEvents.js
// SQUAD: Squad-Back / Motor de búsqueda modifica el orden en el que se muestran los eventos 
// a los sponsors, basándose en la relevancia de cada evento 
// para el sponsor. La función principal es `rankEvents`, 
// que asigna una puntuación a cada evento según criterios como categoría, 
// presupuesto, rango de edad, asistentes esperados e intereses comunes, 
// y luego ordena los eventos por esa puntuación. 
// También incluye una función `normalizeCategory` para manejar categorías legacy y 
// nuevas de manera transparente.

// ── Mapa de categorías legacy → nuevas ───────────────────────────────────────
// Permite que documentos antiguos de la BD sigan puntuando correctamente
// aunque usen los valores del enum anterior.
const LEGACY_CATEGORY_MAP = {
  concert:     'music',
  festival:    'entertainment',
  conference:  'technology',
  sports:      'health',
  networking:  'business',
  other:       'other',
}

/**
 * Normaliza una categoría legacy al nuevo sistema.
 * Si ya es un valor nuevo, la devuelve tal cual.
 */
function normalizeCategory(category) {
  if (!category) return null
  return LEGACY_CATEGORY_MAP[category] ?? category
}

/**
 * Calcula la puntuación de relevancia de un evento para un sponsor (0–100).
 *
 * CRITERIOS:
 *  1. Categoría coincide con preferencias del sponsor   → 30 pts
 *  2. Solapamiento de presupuesto                       → 25 pts
 *  3. Solapamiento de rango de edad                     → 20 pts
 *  4. Asistentes esperados (normalizado al conjunto)    → 15 pts
 *  5. Intereses comunes                                 → 10 pts
 *
 * @param {Object} event          - Documento de evento (plain object)
 * @param {Object} [sponsor]      - Documento de usuario sponsor (plain object)
 * @param {number} [maxAttendees] - Máximo de asistentes en el conjunto
 * @returns {number} 0–100
 */
function scoreEvent(event, sponsor, maxAttendees = 1) {
  let score = 0
  const sp = event.sponsorship

  if (!sp) return 0

  // ── 1. CATEGORÍA (30 pts) ─────────────────────────────────────────────────
  const eventCategory   = normalizeCategory(sp.category)
  const spEventTypes    = sponsor?.sponsorProfile?.preferences?.eventTypes ?? []
  const spNormalized    = spEventTypes.map(normalizeCategory)

  if (spNormalized.length && eventCategory && spNormalized.includes(eventCategory)) {
    score += 30
  }

  // ── 2. PRESUPUESTO (25 pts) ───────────────────────────────────────────────
  const eventMin = sp.budget?.min ?? 0
  const eventMax = sp.budget?.max ?? Infinity
  const spMin    = sponsor?.sponsorProfile?.budget?.min ?? 0
  const spMax    = sponsor?.sponsorProfile?.budget?.max ?? Infinity

  const overlap  = Math.min(eventMax, spMax) - Math.max(eventMin, spMin)
  if (overlap > 0) {
    const eventRange   = (eventMax - eventMin) || 1
    const overlapRatio = overlap / eventRange
    if (overlapRatio >= 0.8)      score += 25
    else if (overlapRatio >= 0.4) score += 15
    else                          score += 8
  }

  // ── 3. RANGO DE EDAD (20 pts) ─────────────────────────────────────────────
  const eventAgeMin = sp.targetAudience?.ageRange?.min ?? 0
  const eventAgeMax = sp.targetAudience?.ageRange?.max ?? 100
  const spAgeMin    = sponsor?.sponsorProfile?.preferences?.targetAudience?.ageRange?.min ?? 0
  const spAgeMax    = sponsor?.sponsorProfile?.preferences?.targetAudience?.ageRange?.max ?? 100

  const ageOverlap  = Math.min(eventAgeMax, spAgeMax) - Math.max(eventAgeMin, spAgeMin)
  if (ageOverlap > 0) {
    const ageRange  = (eventAgeMax - eventAgeMin) || 1
    const ageRatio  = ageOverlap / ageRange
    if (ageRatio >= 0.8)      score += 20
    else if (ageRatio >= 0.4) score += 12
    else                      score += 5
  }

  // ── 4. ASISTENTES ESPERADOS (15 pts) ──────────────────────────────────────
  const attendees = sp.targetAudience?.expectedAttendees ?? 0
  if (maxAttendees > 0) {
    score += Math.round((attendees / maxAttendees) * 15)
  }

  // ── 5. INTERESES COMUNES (10 pts) ─────────────────────────────────────────
  const eventInterests = sp.targetAudience?.interests ?? []
  const spInterests    = sponsor?.sponsorProfile?.preferences?.targetAudience?.interests ?? []

  if (eventInterests.length && spInterests.length) {
    const common = eventInterests.filter(i =>
      spInterests.map(s => s.toLowerCase()).includes(i.toLowerCase())
    ).length
    score += Math.min(common * 2, 10)
  }

  return Math.min(Math.round(score), 100)
}

/**
 * Ordena un array de eventos por relevancia para un sponsor.
 * Si no hay sponsor, ordena por asistentes esperados (mayor primero).
 *
 * @param {Array}   events   - Array de documentos de evento (plain objects)
 * @param {Object}  [sponsor] - Documento de usuario (role === 'sponsor')
 * @returns {Array} Eventos ordenados, cada uno con _score añadido
 */
function rankEvents(events, sponsor = null) {
  if (!events?.length) return []

  const maxAttendees = Math.max(
    ...events.map(e => e.sponsorship?.targetAudience?.expectedAttendees ?? 0),
    1
  )

  return events
    .map(event => ({
      ...event,
      _score: scoreEvent(event, sponsor, maxAttendees),
    }))
    .sort((a, b) => b._score - a._score)
}

export { rankEvents, scoreEvent, normalizeCategory }
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Catálogo, gestión de eventos y flujo de patrocinios
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Catálogo público de eventos
 *     description: |
 *       Lista eventos publicados que buscan patrocinadores.
 *       Si el usuario envía JWT, el orden por relevancia personaliza resultados según su perfil de sponsor.
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o resumen
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [music, technology, gastronomy, culture, business, health, education, entertainment, concert, conference, festival, sports, networking, other]
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [title, gold, silver, bronze, community]
 *         description: Nivel de patrocinio
 *       - in: query
 *         name: sponsorshipStatus
 *         schema:
 *           type: string
 *           enum: [open, closed, in_negotiation]
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *       - in: query
 *         name: minReach
 *         schema:
 *           type: integer
 *         description: Asistentes esperados mínimos
 *       - in: query
 *         name: maxReach
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, attendees, budgetAsc, budgetDesc]
 *           default: relevance
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *           maximum: 48
 *     responses:
 *       200:
 *         description: Lista paginada de eventos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventsResponse'
 *       500:
 *         description: Error interno
 *
 *   post:
 *     summary: Crear evento (borrador)
 *     description: Crea un evento en estado draft. Requiere rol creator.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       201:
 *         description: Evento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEventResponse'
 *       400:
 *         description: Error de validación Zod
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       500:
 *         description: Error al crear el evento
 */

/**
 * @swagger
 * /events/mine:
 *   get:
 *     summary: Mis eventos (creador)
 *     description: Eventos del creador autenticado, incluyendo borradores. Requiere rol **creator**.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [title, gold, silver, bronze, community]
 *       - in: query
 *         name: sponsorshipStatus
 *         schema:
 *           type: string
 *           enum: [open, closed, in_negotiation]
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Lista paginada de eventos del creador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventsResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 */

/**
 * @swagger
 * /events/inbox:
 *   get:
 *     summary: Bandeja de solicitudes de patrocinio
 *     description: |
 *       - **creator**: solicitudes recibidas en todos sus eventos.
 *       - **sponsor**: solicitudes enviadas (excluye rechazadas).
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InboxItem'
 *                 total:
 *                   type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 */

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Detalle de un evento
 *     description: |
 *       Eventos published son públicos e incrementan el contador de vistas.
 *       Borradores u otros estados requieren ser el organizador (JWT).
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       401:
 *         description: Evento no publicado y sin token
 *       403:
 *         description: Evento no publicado y usuario no es el organizador
 *       404:
 *         description: Evento no encontrado
 *
 *   patch:
 *     summary: Actualizar evento (autosave parcial)
 *     description: Actualización parcial de cualquier campo del evento. Solo el organizador. Rol **creator**.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *     responses:
 *       200:
 *         description: Evento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEventResponse'
 *       400:
 *         description: Validación fallida o cuerpo vacío
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es el organizador
 *       404:
 *         description: Evento no encontrado
 *
 *   delete:
 *     summary: Cancelar evento (soft delete)
 *     description: Marca el evento como cancelled y deja de buscar patrocinadores. Solo el organizador.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     responses:
 *       200:
 *         description: Evento cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEventResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es el organizador
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}/dashboard:
 *   get:
 *     summary: Panel de control del evento
 *     description: Estadísticas y patrocinadores del evento. Solo el organizador. Rol **creator**.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventDashboard'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es el organizador
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}/onboarding:
 *   patch:
 *     summary: Publicar evento (onboarding de patrocinio)
 *     description: |
 *       Completa el bloque sponsorship, publica el evento (status published)
 *       y activa la búsqueda de patrocinadores. Solo el organizador. Rol creator.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventOnboardingRequest'
 *     responses:
 *       200:
 *         description: Evento publicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessEventResponse'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es el organizador
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}/apply:
 *   post:
 *     summary: Solicitar patrocinio de un evento
 *     description: El sponsor envía una solicitud a un evento publicado. Rol **sponsor**.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 example: Nos interesa patrocinar su evento por la alineación con nuestra marca tech.
 *     responses:
 *       201:
 *         description: Solicitud enviada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Solicitud enviada correctamente
 *       400:
 *         description: Evento no disponible o validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Evento no encontrado
 *       409:
 *         description: Ya aplicó a este evento
 */

/**
 * @swagger
 * /events/{id}/applications/{appId}:
 *   patch:
 *     summary: Aceptar o rechazar solicitud de patrocinio
 *     description: El creador procesa una solicitud en estado pending. Rol creator.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *       - $ref: '#/components/parameters/applicationId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Solicitud procesada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [accepted, rejected]
 *                 sponsorContact:
 *                   type: object
 *                   description: Solo si status=accepted
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     companyName:
 *                       type: string
 *       400:
 *         description: Estado inválido o solicitud ya procesada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es el organizador
 *       404:
 *         description: Evento o solicitud no encontrados
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateEventRequest:
 *       type: object
 *       required:
 *         - name
 *         - eventType
 *         - location
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: Tech Summit Madrid 2026
 *         summary:
 *           type: string
 *           maxLength: 140
 *           example: Conferencia de innovación para startups
 *         introduction:
 *           type: string
 *         eventType:
 *           type: string
 *           enum: [single, recurring]
 *         singleDate:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               format: date-time
 *               example: "2026-10-15T18:00:00.000Z"
 *             endTime:
 *               type: string
 *               format: date-time
 *               example: "2026-10-15T22:00:00.000Z"
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         media:
 *           $ref: '#/components/schemas/EventMedia'
 *
 *     EventOnboardingRequest:
 *       type: object
 *       required:
 *         - sponsorship
 *       properties:
 *         sponsorship:
 *           type: object
 *           required:
 *             - category
 *             - targetAudience
 *             - collaborationTypes
 *             - budget
 *             - pitch
 *           properties:
 *             category:
 *               type: string
 *               enum: [music, technology, gastronomy, culture, business, health, education, entertainment, concert, conference, festival, sports, networking, other]
 *             targetAudience:
 *               type: object
 *               required:
 *                 - expectedAttendees
 *               properties:
 *                 expectedAttendees:
 *                   type: number
 *                   minimum: 1
 *                   example: 500
 *             digitalReach:
 *               type: object
 *               properties:
 *                 estimatedOnlineViewers:
 *                   type: number
 *                   minimum: 0
 *             collaborationTypes:
 *               type: array
 *               minItems: 1
 *               items:
 *                 type: string
 *                 enum: [financial, services, brand_collaboration, other]
 *               example: [financial, brand_collaboration]
 *             budget:
 *               type: object
 *               required:
 *                 - min
 *                 - max
 *               properties:
 *                 min:
 *                   type: number
 *                   minimum: 0
 *                   example: 2000
 *                 max:
 *                   type: number
 *                   minimum: 0
 *                   example: 10000
 *             pitch:
 *               type: string
 *               minLength: 30
 *               maxLength: 1500
 *               example: Buscamos marcas tech que quieran visibilidad en nuestra conferencia con 500 asistentes y streaming en vivo.
 *             socialLinks:
 *               type: object
 *               properties:
 *                 whatsapp:
 *                   type: string
 *                 instagram:
 *                   type: string
 *                 youtube:
 *                   type: string
 *
 *     UpdateEventRequest:
 *       type: object
 *       description: Al menos un campo es obligatorio
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *         summary:
 *           type: string
 *           maxLength: 140
 *         introduction:
 *           type: string
 *         singleDate:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               format: date-time
 *             endTime:
 *               type: string
 *               format: date-time
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         usefulInfo:
 *           type: object
 *           properties:
 *             highlights:
 *               type: object
 *               properties:
 *                 ageRestriction:
 *                   type: string
 *                   enum: [all_ages, "+12", "+16", "+18", "+21", guardian_under_14, guardian_under_16, guardian_under_18, guardian_under_21]
 *                 parking:
 *                   type: string
 *                   enum: [free, paid, none]
 *             faq:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 *         cast:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               image:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isHeadliner:
 *                 type: boolean
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   instagram:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   facebook:
 *                     type: string
 *                   website:
 *                     type: string
 *         agenda:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - title
 *               properties:
 *                 title:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 hostOrArtist:
 *                   type: string
 *                 description:
 *                   type: string
 *         sponsorship:
 *           $ref: '#/components/schemas/EventSponsorship'
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, finished]
 */

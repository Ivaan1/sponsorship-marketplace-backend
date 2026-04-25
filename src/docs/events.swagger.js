/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Endpoints de eventos y postulaciones
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtener listado de eventos publicados
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Texto de busqueda por nombre o resumen
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [music, technology, gastronomy, culture, business, health, education, entertainment, concert, conference, festival, sports, networking, other]
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
 *       - in: query
 *         name: maxReach
 *         schema:
 *           type: integer
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *       - in: query
 *         name: sponsorshipStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, attendees, budgetAsc, budgetDesc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de eventos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventsResponse'
 *             example:
 *               data:
 *                 - _id: 680b90190c2c2b0012345681
 *                   name: Evento Test 1
 *                   summary: Un evento de prueba para los tests de integracion.
 *                   status: published
 *                   sponsorship:
 *                     isLookingForSponsors: true
 *                     category: music
 *                     sponsorshipStatus: open
 *                     budget:
 *                       min: 1000
 *                       max: 5000
 *                     targetAudience:
 *                       expectedAttendees: 1000
 *                   organizer:
 *                     _id: 680b8fbe0c2c2b0012345680
 *                     name: Creator Test
 *                     email: creator@test.com
 *                   createdAt: "2026-04-25T10:00:00.000Z"
 *                   updatedAt: "2026-04-25T10:00:00.000Z"
 *               total: 1
 *               page: 1
 *               pages: 1
 *               limit: 12
 */

/**
 * @swagger
 * /events/mine:
 *   get:
 *     summary: Obtener eventos del creador autenticado
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista paginada de eventos del creador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventsResponse'
 *             example:
 *               data:
 *                 - _id: 680b90190c2c2b0012345681
 *                   name: Festival Test 2025
 *                   summary: Un evento borrador del creador.
 *                   eventType: single
 *                   status: draft
 *                   organizer:
 *                     _id: 680b8fbe0c2c2b0012345680
 *                     name: Creator Test
 *                     email: creator@test.com
 *                   location:
 *                     type: venue
 *                     venue:
 *                       name: Sala Test
 *                       city: Madrid
 *                       country: España
 *                   sponsorship:
 *                     isLookingForSponsors: false
 *                 - _id: 680b90190c2c2b0012345682
 *                   name: Evento Publicado
 *                   status: published
 *               total: 2
 *               page: 1
 *               pages: 1
 *               limit: 12
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /events/inbox:
 *   get:
 *     summary: Obtener inbox de postulaciones del usuario autenticado
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inbox de postulaciones
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CreatorInboxResponse'
 *                 - $ref: '#/components/schemas/SponsorInboxResponse'
 *             examples:
 *               creatorInbox:
 *                 summary: Respuesta para role creator
 *                 value:
 *                   data:
 *                     - eventId: 680b90190c2c2b0012345681
 *                       eventName: Festival Test 2025
 *                       applicationId: 680b90970c2c2b0012345691
 *                       status: pending
 *                       appliedAt: "2026-04-25T11:00:00.000Z"
 *                       sponsor:
 *                         id: 680b8e8a0c2c2b0012345678
 *                         name: Sponsor Test
 *                         companyName: Acme Corp
 *                   total: 1
 *               sponsorInbox:
 *                 summary: Respuesta para role sponsor
 *                 value:
 *                   data:
 *                     - eventId: 680b90190c2c2b0012345681
 *                       eventName: Festival Test 2025
 *                       applicationId: 680b90970c2c2b0012345691
 *                       status: accepted
 *                       appliedAt: "2026-04-25T11:00:00.000Z"
 *                       creatorContact:
 *                         name: Creador Test
 *                         email: creator@test.com
 *                   total: 1
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol no permitido
 */

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtener detalle de evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *             example:
 *               _id: 680b90190c2c2b0012345681
 *               name: Festival Test 2025
 *               summary: Un evento de prueba para los tests de integracion.
 *               eventType: single
 *               status: published
 *               organizer:
 *                 _id: 680b8fbe0c2c2b0012345680
 *                 name: Creator Test
 *                 email: creator@test.com
 *               sponsorship:
 *                 isLookingForSponsors: true
 *                 category: music
 *                 sponsorshipStatus: open
 *                 collaborationTypes: [financial]
 *                 budget:
 *                   min: 1000
 *                   max: 5000
 *                 targetAudience:
 *                   expectedAttendees: 1000
 *                 sponsorsApplied:
 *                   - sponsor: 680b8e8a0c2c2b0012345678
 *                     status: pending
 *                     message: Nos interesa patrocinar este evento.
 *                     appliedAt: "2026-04-25T11:00:00.000Z"
 *               createdAt: "2026-04-25T10:00:00.000Z"
 *               updatedAt: "2026-04-25T10:00:00.000Z"
 *       401:
 *         description: Token requerido para eventos no publicados
 *       403:
 *         description: No autorizado para ver el evento
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crear un nuevo evento (estado draft)
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
 *         description: Evento creado correctamente
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Actualizar un evento propio
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventRequest'
 *     responses:
 *       200:
 *         description: Evento actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado para editar este evento
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Cancelar un evento propio
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento cancelado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado para cancelar este evento
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}/onboarding:
 *   patch:
 *     summary: Publicar un evento completando datos de sponsorship
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sponsorship
 *             properties:
 *               sponsorship:
 *                 $ref: '#/components/schemas/EventOnboardingSponsorship'
 *     responses:
 *       200:
 *         description: Onboarding de evento completado y publicado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No autorizado para actualizar este evento
 *       404:
 *         description: Evento no encontrado
 */

/**
 * @swagger
 * /events/{id}/apply:
 *   post:
 *     summary: Postularse como sponsor a un evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 example: Nos interesa patrocinar este evento.
 *     responses:
 *       201:
 *         description: Solicitud enviada correctamente
 *       400:
 *         description: Evento no disponible
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo sponsors pueden aplicar
 *       404:
 *         description: Evento no encontrado
 *       409:
 *         description: Ya existe una postulacion para este sponsor
 */

/**
 * @swagger
 * /events/{id}/applications/{appId}:
 *   patch:
 *     summary: Aceptar o rechazar una postulacion de sponsor
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Estado de postulacion actualizado
 *       400:
 *         description: Estado invalido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo creadores pueden gestionar postulaciones
 *       404:
 *         description: Evento o postulacion no encontrado
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
 *           example: Festival Test 2025
 *         summary:
 *           type: string
 *           maxLength: 140
 *           example: Un evento de prueba para los tests de integracion.
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
 *             endTime:
 *               type: string
 *               format: date-time
 *         location:
 *           type: object
 *           required:
 *             - type
 *           properties:
 *             type:
 *               type: string
 *               enum: [venue, online, tba]
 *             venue:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 address1:
 *                   type: string
 *                 city:
 *                   type: string
 *                 country:
 *                   type: string
 *             onlineUrl:
 *               type: string
 *               format: uri
 *         media:
 *           type: object
 *           properties:
 *             images:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - url
 *                 properties:
 *                   url:
 *                     type: string
 *                     format: uri
 *                   format:
 *                     type: string
 *                     enum: [jpeg, png]
 *
 *     UpdateEventRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *         summary:
 *           type: string
 *           maxLength: 140
 *         introduction:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [venue, online, tba]
 *             venue:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 address1:
 *                   type: string
 *                 city:
 *                   type: string
 *                 country:
 *                   type: string
 *             onlineUrl:
 *               type: string
 *               format: uri
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, finished]
 *
 *     EventOnboardingSponsorship:
 *       type: object
 *       required:
 *         - category
 *         - targetAudience
 *         - collaborationTypes
 *         - budget
 *         - pitch
 *       properties:
 *         category:
 *           type: string
 *           enum: [music, technology, gastronomy, culture, business, health, education, entertainment, concert, conference, festival, sports, networking, other]
 *         targetAudience:
 *           type: object
 *           required:
 *             - expectedAttendees
 *           properties:
 *             expectedAttendees:
 *               type: number
 *               minimum: 1
 *         digitalReach:
 *           type: object
 *           properties:
 *             estimatedOnlineViewers:
 *               type: number
 *               minimum: 0
 *         collaborationTypes:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: string
 *             enum: [financial, services, brand_collaboration, other]
 *         budget:
 *           type: object
 *           required:
 *             - min
 *             - max
 *           properties:
 *             min:
 *               type: number
 *               minimum: 0
 *             max:
 *               type: number
 *               minimum: 0
 *         pitch:
 *           type: string
 *           minLength: 30
 *           maxLength: 1500
 *         socialLinks:
 *           type: object
 *           properties:
 *             whatsapp:
 *               type: string
 *             instagram:
 *               type: string
 *             youtube:
 *               type: string
 *
 *     EventOrganizer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *
 *     EventLocation:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [venue, online, tba]
 *         venue:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address1:
 *               type: string
 *             address2:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         onlineUrl:
 *           type: string
 *
 *     EventSponsorship:
 *       type: object
 *       properties:
 *         isLookingForSponsors:
 *           type: boolean
 *         category:
 *           type: string
 *         budget:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *         targetAudience:
 *           type: object
 *           properties:
 *             ageRange:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *             interests:
 *               type: array
 *               items:
 *                 type: string
 *             expectedAttendees:
 *               type: number
 *         collaborationTypes:
 *           type: array
 *           items:
 *             type: string
 *         pitch:
 *           type: string
 *         socialLinks:
 *           type: object
 *           properties:
 *             whatsapp:
 *               type: string
 *             instagram:
 *               type: string
 *             youtube:
 *               type: string
 *         sponsorshipLevel:
 *           type: string
 *           enum: [title, gold, silver, bronze, community]
 *         digitalReach:
 *           type: object
 *           properties:
 *             estimatedOnlineViewers:
 *               type: number
 *             streamingPlatforms:
 *               type: array
 *               items:
 *                 type: string
 *             socialMediaImpressions:
 *               type: number
 *             hasLivestream:
 *               type: boolean
 *         previousSponsors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               year:
 *                 type: number
 *         sponsorshipStatus:
 *           type: string
 *           enum: [open, closed, in_negotiation]
 *         sponsorsApplied:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               sponsor:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected]
 *               message:
 *                 type: string
 *               appliedAt:
 *                 type: string
 *                 format: date-time
 *
 *     EventResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         organizer:
 *           oneOf:
 *             - $ref: '#/components/schemas/EventOrganizer'
 *             - type: string
 *         name:
 *           type: string
 *         summary:
 *           type: string
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
 *             endTime:
 *               type: string
 *               format: date-time
 *         location:
 *           $ref: '#/components/schemas/EventLocation'
 *         sponsorship:
 *           $ref: '#/components/schemas/EventSponsorship'
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, finished]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedEventsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventResponse'
 *         total:
 *           type: number
 *         page:
 *           type: number
 *         pages:
 *           type: number
 *         limit:
 *           type: number
 *
 *     CreatorInboxItem:
 *       type: object
 *       properties:
 *         eventId:
 *           type: string
 *         eventName:
 *           type: string
 *         applicationId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         appliedAt:
 *           type: string
 *           format: date-time
 *         sponsor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             companyName:
 *               type: string
 *
 *     SponsorInboxItem:
 *       type: object
 *       properties:
 *         eventId:
 *           type: string
 *         eventName:
 *           type: string
 *         applicationId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         appliedAt:
 *           type: string
 *           format: date-time
 *         creatorContact:
 *           nullable: true
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *
 *     CreatorInboxResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreatorInboxItem'
 *         total:
 *           type: number
 *
 *     SponsorInboxResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SponsorInboxItem'
 *         total:
 *           type: number
 */

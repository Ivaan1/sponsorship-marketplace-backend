/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Descripción del error
 *
 *     AuthTokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT para usar en Authorization Bearer
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: Juan Pérez
 *             email:
 *               type: string
 *               example: sponsor@mail.com
 *             role:
 *               type: string
 *               enum: [sponsor, creator]
 *             onboardingCompleted:
 *               type: boolean
 *               example: false
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 69bbeb8e881c77b3af383897
 *         name:
 *           type: string
 *           example: Juan Pérez
 *         email:
 *           type: string
 *           example: hola@gmail.com
 *         role:
 *           type: string
 *           enum: [sponsor, creator, admin]
 *         profilePicture:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         socialLinks:
 *           type: object
 *           properties:
 *             instagram:
 *               type: string
 *             twitter:
 *               type: string
 *             website:
 *               type: string
 *         sponsorProfile:
 *           $ref: '#/components/schemas/SponsorProfile'
 *         creatorProfile:
 *           type: object
 *           properties:
 *             contactEmail:
 *               type: string
 *               format: email
 *         isActive:
 *           type: boolean
 *         onboardingCompleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     SponsorProfile:
 *       type: object
 *       properties:
 *         companyName:
 *           type: string
 *           example: Innovatech Solutions
 *         industry:
 *           type: string
 *           enum: [tech, food, fashion, sports, music, finance, health, other]
 *         companySize:
 *           type: string
 *           enum: [startup, pyme, enterprise]
 *         sponsorshipObjective:
 *           type: string
 *           enum: [brand_awareness, lead_generation, pr_networking, csr]
 *         contributionType:
 *           type: string
 *           enum: [money, services, in_kind, mixed]
 *         geographicScope:
 *           type: string
 *           enum: [local, regional, national, international]
 *         brandValues:
 *           type: array
 *           items:
 *             type: string
 *         budget:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *             max:
 *               type: number
 *         preferences:
 *           type: object
 *           properties:
 *             eventTypes:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [concert, conference, festival, sports, networking, other]
 *             targetAudience:
 *               type: object
 *               properties:
 *                 ageRange:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 *                 location:
 *                   type: string
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *
 *     EventLocation:
 *       type: object
 *       required:
 *         - type
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
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         onlineUrl:
 *           type: string
 *           format: uri
 *
 *     EventMedia:
 *       type: object
 *       properties:
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               format:
 *                 type: string
 *                 enum: [jpeg, png]
 *
 *     EventSponsorship:
 *       type: object
 *       properties:
 *         isLookingForSponsors:
 *           type: boolean
 *         category:
 *           type: string
 *           enum: [music, technology, gastronomy, culture, business, health, education, entertainment, concert, conference, festival, sports, networking, other]
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
 *             enum: [financial, services, brand_collaboration, other]
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
 *         sponsorshipStatus:
 *           type: string
 *           enum: [open, closed, in_negotiation]
 *         geographicScope:
 *           type: string
 *           enum: [local, regional, national, international]
 *         digitalReach:
 *           type: object
 *           properties:
 *             estimatedOnlineViewers:
 *               type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *
 *     EventCatalogItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         summary:
 *           type: string
 *         media:
 *           $ref: '#/components/schemas/EventMedia'
 *         organizer:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, finished]
 *         sponsorship:
 *           $ref: '#/components/schemas/EventSponsorship'
 *         _score:
 *           type: number
 *           nullable: true
 *           description: Puntuación de relevancia (solo con sortBy=relevance)
 *
 *     PaginatedEventsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventCatalogItem'
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         pages:
 *           type: integer
 *         limit:
 *           type: integer
 *
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         organizer:
 *           oneOf:
 *             - type: string
 *             - $ref: '#/components/schemas/User'
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
 *         media:
 *           $ref: '#/components/schemas/EventMedia'
 *         sponsorship:
 *           $ref: '#/components/schemas/EventSponsorship'
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, finished]
 *         calculatedImpact:
 *           type: object
 *           properties:
 *             local:
 *               type: number
 *             international:
 *               type: number
 *         analytics:
 *           type: object
 *           properties:
 *             views:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     SuccessEventResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Event'
 *
 *     InboxItem:
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
 *         message:
 *           type: string
 *         sponsor:
 *           type: object
 *           description: Solo visible para creators
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             companyName:
 *               type: string
 *         creatorContact:
 *           type: object
 *           nullable: true
 *           description: Solo visible para sponsors cuando status=accepted
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *
 *     EventDashboard:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             stats:
 *               type: object
 *               properties:
 *                 ventasNetas:
 *                   type: number
 *                 entradasVendidas:
 *                   type: number
 *                 visitas:
 *                   type: number
 *                 patrocinadoresCount:
 *                   type: number
 *                 financiacionTotal:
 *                   type: number
 *             sponsors:
 *               type: array
 *               items:
 *                 type: object
 *             eventInfo:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 status:
 *                   type: string
 *
 *   parameters:
 *     eventId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del evento (MongoDB ObjectId)
 *     applicationId:
 *       in: path
 *       name: appId
 *       required: true
 *       schema:
 *         type: string
 *       description: ID de la solicitud de patrocinio
 *     userId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: ID del usuario (MongoDB ObjectId)
 */

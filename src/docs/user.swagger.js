/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de usuarios
 */
 
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublicUser'
 *             example:
 *               - _id: 680b8e8a0c2c2b0012345678
 *                 name: Sponsor Test
 *                 email: sponsor@test.com
 *                 role: sponsor
 *                 isVerified: false
 *                 isActive: true
 *                 onboardingCompleted: false
 *                 createdAt: "2026-04-25T10:00:00.000Z"
 *                 updatedAt: "2026-04-25T10:00:00.000Z"
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *             example:
 *               _id: 680b8e8a0c2c2b0012345678
 *               name: Sponsor Test
 *               email: sponsor@test.com
 *               role: sponsor
 *               isVerified: false
 *               isActive: true
 *               onboardingCompleted: true
 *               sponsorProfile:
 *                 companyName: Acme Corp
 *                 industry: tech
 *               createdAt: "2026-04-25T10:00:00.000Z"
 *               updatedAt: "2026-04-25T10:10:00.000Z"
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Actualizar el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMeRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Error de validacion
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Desactivar el usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *             example:
 *               _id: 680b8e8a0c2c2b0012345678
 *               name: Creator Test
 *               email: creator@test.com
 *               role: creator
 *               isVerified: false
 *               isActive: true
 *               onboardingCompleted: false
 *               createdAt: "2026-04-25T10:00:00.000Z"
 *               updatedAt: "2026-04-25T10:00:00.000Z"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/onboarding:
 *   patch:
 *     summary: Completa el onboarding del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SponsorOnboarding'
 *     responses:
 *       200:
 *         description: Onboarding completado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SponsorOnboarding:
 *       type: object
 *       required:
 *         - sponsorProfile
 *       properties:
 *         sponsorProfile:
 *           type: object
 *           required:
 *             - companyName
 *             - industry
 *             - companySize
 *             - sponsorshipObjective
 *             - contributionType
 *             - geographicScope
 *             - brandValues
 *             - budget
 *             - preferences
 *           properties:
 *             companyName:
 *               type: string
 *               minLength: 2
 *               example: Innovatech Solutions
 *             industry:
 *               type: string
 *               enum: [tech, food, fashion, sports, music, finance, health, other]
 *             companySize:
 *               type: string
 *               enum: [startup, pyme, enterprise]
 *             sponsorshipObjective:
 *               type: string
 *               enum: [brand_awareness, lead_generation, pr_networking, csr]
 *             contributionType:
 *               type: string
 *               enum: [money, services, in_kind, mixed]
 *             geographicScope:
 *               type: string
 *               enum: [local, regional, national, international]
 *             brandValues:
 *               type: array
 *               minItems: 1
 *               items:
 *                 type: string
 *               example: [innovacion, sostenibilidad]
 *             budget:
 *               type: object
 *               required:
 *                 - min
 *                 - max
 *               properties:
 *                 min:
 *                   type: number
 *                   example: 1000
 *                 max:
 *                   type: number
 *                   example: 5000
 *             preferences:
 *               type: object
 *               required:
 *                 - eventTypes
 *                 - targetAudience
 *               properties:
 *                 eventTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [concert, conference, festival, sports, networking, other]
 *                   example: [conference, networking]
 *                 targetAudience:
 *                   type: object
 *                   required:
 *                     - ageRange
 *                     - location
 *                     - interests
 *                   properties:
 *                     ageRange:
 *                       type: object
 *                       required:
 *                         - min
 *                         - max
 *                       properties:
 *                         min:
 *                           type: number
 *                           example: 18
 *                         max:
 *                           type: number
 *                           example: 40
 *                     location:
 *                       type: string
 *                       example: Madrid, España
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [software, startups, blockchain]
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 69bbeb8e881c77b3af383897
 *         email:
 *           type: string
 *           example: hola@gmail.com
 *         role:
 *           type: string
 *           enum: [sponsor, creator]
 *         isVerified:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         onboardingCompleted:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         sponsorProfile:
 *           $ref: '#/components/schemas/SponsorOnboarding'
 *
 *     PublicUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [sponsor, creator]
 *         sponsorProfile:
 *           type: object
 *           properties:
 *             companyName:
 *               type: string
 *             industry:
 *               type: string
 *               enum: [tech, food, fashion, sports, music, finance, health, other]
 *             companySize:
 *               type: string
 *               enum: [startup, pyme, enterprise]
 *             sponsorshipObjective:
 *               type: string
 *               enum: [brand_awareness, lead_generation, pr_networking, csr]
 *             contributionType:
 *               type: string
 *               enum: [money, services, in_kind, mixed]
 *             geographicScope:
 *               type: string
 *               enum: [local, regional, national, international]
 *             brandValues:
 *               type: array
 *               items:
 *                 type: string
 *             budget:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *             preferences:
 *               type: object
 *               properties:
 *                 eventTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                 targetAudience:
 *                   type: object
 *                   properties:
 *                     ageRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                         max:
 *                           type: number
 *                     location:
 *                       type: string
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 *         creatorProfile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             location:
 *               type: string
 *             company:
 *               type: string
 *             position:
 *               type: string
 *             profileImage:
 *               type: string
 *         isVerified:
 *           type: boolean
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
 *     UpdateMeRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: Ivan
 *         sponsorProfile:
 *           type: object
 *           properties:
 *             companyName:
 *               type: string
 *               minLength: 2
 *             industry:
 *               type: string
 *               enum: [tech, food, fashion, sports, music, finance, health, other]
 *             companySize:
 *               type: string
 *               enum: [startup, pyme, enterprise]
 *             sponsorshipObjective:
 *               type: string
 *               enum: [brand_awareness, lead_generation, pr_networking, csr]
 *             contributionType:
 *               type: string
 *               enum: [money, services, in_kind, mixed]
 *             geographicScope:
 *               type: string
 *               enum: [local, regional, national, international]
 *             brandValues:
 *               type: array
 *               minItems: 1
 *               items:
 *                 type: string
 *             budget:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                   minimum: 0
 *                 max:
 *                   type: number
 *                   minimum: 0
 *             preferences:
 *               type: object
 *               properties:
 *                 eventTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [concert, conference, festival, sports, networking, other]
 *                 targetAudience:
 *                   type: object
 *                   properties:
 *                     ageRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                         max:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                     location:
 *                       type: string
 *                       minLength: 2
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 *         creatorProfile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               minLength: 1
 *             lastName:
 *               type: string
 *               minLength: 1
 *             location:
 *               type: string
 *               minLength: 1
 *             company:
 *               type: string
 *               minLength: 1
 *             position:
 *               type: string
 *               minLength: 1
 *             profileImage:
 *               type: string
 *               format: uri
 */
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Perfil, onboarding y gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuarios
 *     description: Devuelve todos los usuarios (sin contraseña). Requiere autenticación.
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
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *
 *   patch:
 *     summary: Actualizar perfil propio
 *     description: |
 *       Actualización parcial del perfil. No se pueden modificar role, email, password ni _id.
 *       - Un creator no puede enviar sponsorProfile.
 *       - Un sponsor no puede enviar creatorProfile.
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
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validación fallida o perfil incompatible con el rol
 *       401:
 *         description: No autenticado
 *
 *   delete:
 *     summary: Desactivar cuenta propia
 *     description: Soft delete. Marca isActive en false sin borrar el documento.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuario desactivado correctamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /users/onboarding:
 *   patch:
 *     summary: Completar onboarding de sponsor
 *     description: |
 *       Completa el perfil de patrocinador y marca onboardingCompleted en true.
 *       Solo disponible para usuarios con rol **sponsor**.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SponsorOnboardingRequest'
 *     responses:
 *       200:
 *         description: Onboarding completado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Perfil de sponsor actualizado correctamente
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido (solo sponsor)
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMeRequest:
 *       type: object
 *       description: Al menos un campo es obligatorio
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *         profilePicture:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *           maxLength: 500
 *         socialLinks:
 *           type: object
 *           properties:
 *             instagram:
 *               type: string
 *               format: uri
 *             twitter:
 *               type: string
 *               format: uri
 *             website:
 *               type: string
 *               format: uri
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         sponsorProfile:
 *           $ref: '#/components/schemas/SponsorProfile'
 *         creatorProfile:
 *           type: object
 *           properties:
 *             contactEmail:
 *               type: string
 *               format: email
 *
 *     SponsorOnboardingRequest:
 *       type: object
 *       required:
 *         - sponsorProfile
 *       properties:
 *         sponsorProfile:
 *           type: object
 *           required:
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
 *               example: tech
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
 *               required:
 *                 - min
 *                 - max
 *               properties:
 *                 min:
 *                   type: number
 *                   minimum: 0
 *                   example: 1000
 *                 max:
 *                   type: number
 *                   minimum: 0
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
 *                           minimum: 0
 *                           maximum: 100
 *                           example: 18
 *                         max:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                           example: 40
 *                     location:
 *                       type: string
 *                       minLength: 2
 *                       example: Madrid, España
 *                     interests:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [software, startups, blockchain]
 */

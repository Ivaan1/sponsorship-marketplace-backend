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
 *             oneOf:
 *               - $ref: '#/components/schemas/SponsorOnboarding'
 *               - $ref: '#/components/schemas/CreatorOnboarding'
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
 *         - companyName
 *         - industry
 *       properties:
 *         companyName:
 *           type: string
 *           example: Innovatech Solutions
 *         industry:
 *           type: string
 *           example: tech
 *         sponsorProfile:
 *           type: object
 *           properties:
 *             budget:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                   example: 1000
 *                 max:
 *                   type: number
 *                   example: 5000
 *             preferences:
 *               type: object
 *               properties:
 *                 targetAudience:
 *                   type: object
 *                   properties:
 *                     ageRange:
 *                       type: object
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
 *                 eventTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [conference, networking]
 *
 *     CreatorOnboarding:
 *       type: object
 *       required:
 *         - username
 *         - category
 *       properties:
 *         username:
 *           type: string
 *           example: creator123
 *         category:
 *           type: string
 *           example: tech
 *         followers:
 *           type: number
 *           example: 5000
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
 */
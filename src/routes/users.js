import express from 'express'
import { getUsers, getMe, getUserById, updateMe, deleteMe, updateOnboarding } from '../controllers/users.js'
import authMiddleware from '../middlewares/session.js'
import validatorMiddleware from '../middlewares/validator.js'
import { updateMeSchema } from '../validators/users.js'
import { sponsorOnboardingSchema } from '../validators/onboarding.js'
import checkRole from '../middlewares/role.js'

const router = express.Router()

router.get('/', authMiddleware, getUsers); //checkRole(['admin']) se implementará en la siguiente iteración
router.get('/me', authMiddleware, getMe);

router.patch('/me', authMiddleware, validatorMiddleware(updateMeSchema), updateMe);

router.delete('/me', authMiddleware, deleteMe);

router.get('/:id', authMiddleware, getUserById);

router.patch("/onboarding", authMiddleware, 
    checkRole(['sponsor']), //solo los sponsors hacen onboarding, no los creators
    validatorMiddleware(sponsorOnboardingSchema), 
    updateOnboarding
);


export default router
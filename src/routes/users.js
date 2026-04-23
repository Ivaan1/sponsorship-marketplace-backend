const express = require('express');
const router = express.Router();

const { getUsers, getMe, getUserById, updateMe, deleteMe, updateOnboarding } = require('../controllers/users');
const authMiddleware = require('../middlewares/session');
const validatorMiddleware = require('../middlewares/validator');
const { updateMeSchema } = require('../validators/users');
const { sponsorOnboardingSchema } = require('../validators/onboarding');

router.get('/', authMiddleware, getUsers);

router.get('/me', authMiddleware, getMe);

router.patch('/me', authMiddleware, validatorMiddleware(updateMeSchema), updateMe);

router.delete('/me', authMiddleware, deleteMe);

router.get('/:id', authMiddleware, getUserById);

router.patch("/onboarding", authMiddleware, 
    validatorMiddleware(sponsorOnboardingSchema), 
    updateOnboarding
);


module.exports = router;
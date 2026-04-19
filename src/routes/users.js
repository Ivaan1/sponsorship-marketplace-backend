const express = require('express');
const router = express.Router();

const { getUsers,getUserById,getUserByName } = require('../controllers/users');
const authMiddleware = require('../middlewares/session');
const validatorMiddleware = require('../middlewares/validator');
const { updateOnboarding } = require('../controllers/users');
const { sponsorOnboardingSchema, creatorOnboardingSchema } = require('../validators/onboarding');

router.get('/', getUsers);

/**
 * @deprecated Este endpoint se eliminará en la versión 2.0. 
 * Usar GET /api/events con query params en su lugar.
 */
router.get('/name/:name',getUserByName);

router.get('/id/:id',getUserById);


router.patch("/onboarding", authMiddleware, 
    (req, res, next) => {
        const schema = req.user.role === "sponsor" ? sponsorOnboardingSchema : creatorOnboardingSchema;
        return validatorMiddleware(schema)(req, res, next);
    }, 
    updateOnboarding
);

router.patch(
    "/onboarding-creator", 
    authMiddleware, 
    validatorMiddleware(creatorOnboardingSchema), 
    updateOnboarding
);

module.exports = router;
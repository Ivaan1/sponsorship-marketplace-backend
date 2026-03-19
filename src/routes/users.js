const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/session');
const validatorMiddleware = require('../middlewares/validator');
const { updateOnboarding } = require('../controllers/users');
const { sponsorOnboardingSchema, creatorOnboardingSchema } = require('../validators/onboarding');

router.patch("/onboarding", authMiddleware, 
    (req, res, next) => {
        const schema = req.user.role === "sponsor" ? sponsorOnboardingSchema : creatorOnboardingSchema;
        return validatorMiddleware(schema)(req, res, next);
    }, 
    updateOnboarding
);

module.exports = router;
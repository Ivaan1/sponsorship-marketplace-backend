import express from 'express'
import authRoutes from './auth.js'
import usersRoutes from './users.js'
import eventsRoutes from './events.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/events', eventsRoutes)

export default router
import express from 'express'
import { getDashboardStats } from '../controllers/dashboardController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticate, authorizeAdmin, getDashboardStats)

export default router
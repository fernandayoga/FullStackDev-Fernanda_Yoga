import express from 'express'
import { exportBookingReport } from '../controllers/reportController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.get('/export', authenticate, authorizeAdmin, exportBookingReport)

export default router
import express from 'express'
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getMyBookings,
  completeBooking
} from '../controllers/bookingController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticate, authorizeAdmin, getAllBookings)
router.get('/my', authenticate, getMyBookings)
router.get('/:id', authenticate, getBookingById)
router.post('/', authenticate, authorizeAdmin, createBooking)
router.patch('/:id/complete', authenticate, authorizeAdmin, completeBooking)

export default router
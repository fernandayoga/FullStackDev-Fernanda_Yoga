import express from 'express'
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
} from '../controllers/driverController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticate, getAllDrivers)
router.get('/:id', authenticate, getDriverById)
router.post('/', authenticate, authorizeAdmin, createDriver)
router.put('/:id', authenticate, authorizeAdmin, updateDriver)
router.delete('/:id', authenticate, authorizeAdmin, deleteDriver)

export default router
import express from 'express'
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', authenticate, getAllVehicles)
router.get('/:id', authenticate, getVehicleById)
router.post('/', authenticate, authorizeAdmin, createVehicle)
router.put('/:id', authenticate, authorizeAdmin, updateVehicle)
router.delete('/:id', authenticate, authorizeAdmin, deleteVehicle)

export default router
import express from 'express'
import { register, login, getMe, getAllUsers } from '../controllers/authController.js'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getMe)
router.get('/users', authenticate, authorizeAdmin, getAllUsers)

export default router
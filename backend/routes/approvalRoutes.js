import express from 'express'
import { processApproval, getMyApprovals } from '../controllers/approvalController.js'
import { authenticate } from '../middlewares/auth.js'

const router = express.Router()

router.get('/my', authenticate, getMyApprovals)
router.patch('/:id', authenticate, processApproval)

export default router
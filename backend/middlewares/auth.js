import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' })
  }
  next()
}

export const authorizeApprover = (req, res, next) => {
  if (req.user.role !== 'approver') {
    return res.status(403).json({ message: 'Approver access only' })
  }
  next()
}
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './models/index.js'
import { logger } from './middlewares/logger.js'
import authRoutes from './routes/authRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import approvalRoutes from './routes/approvalRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(logger)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)

const PORT = process.env.PORT || 5000

sequelize.sync({ force: false })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
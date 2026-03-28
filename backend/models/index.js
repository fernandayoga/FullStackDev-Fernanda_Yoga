import sequelize from '../config/database.js'
import User from './User.js'
import Vehicle from './Vehicle.js'
import Driver from './Driver.js'
import Booking from './Booking.js'
import Approval from './Approval.js'

// Booking relations
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'requester' })
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' })
Booking.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' })
Booking.hasMany(Approval, { foreignKey: 'booking_id', as: 'approvals' })

// Approval relations
Approval.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' })
Approval.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' })

export { sequelize, User, Vehicle, Driver, Booking, Approval }
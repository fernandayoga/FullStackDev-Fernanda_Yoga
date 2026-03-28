import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
})

export default Booking
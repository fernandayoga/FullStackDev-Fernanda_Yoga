import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('available', 'on_duty'),
    defaultValue: 'available'
  }
}, {
  timestamps: true
})

export default Driver
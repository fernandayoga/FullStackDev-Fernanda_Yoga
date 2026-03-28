import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plate_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('passenger', 'cargo'),
    allowNull: false
  },
  ownership: {
    type: DataTypes.ENUM('own', 'rent'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance'),
    defaultValue: 'available'
  }
}, {
  timestamps: true
})

export default Vehicle
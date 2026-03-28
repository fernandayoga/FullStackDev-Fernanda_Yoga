import { Vehicle } from '../models/index.js'

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll()
    return res.status(200).json({ data: vehicles })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }
    return res.status(200).json({ data: vehicle })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const createVehicle = async (req, res) => {
  try {
    const { name, plate_number, type, ownership } = req.body

    const existing = await Vehicle.findOne({ where: { plate_number } })
    if (existing) {
      return res.status(400).json({ message: 'Plate number already exists' })
    }

    const vehicle = await Vehicle.create({ name, plate_number, type, ownership })
    return res.status(201).json({ message: 'Vehicle created successfully', data: vehicle })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    await vehicle.update(req.body)
    return res.status(200).json({ message: 'Vehicle updated successfully', data: vehicle })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    await vehicle.destroy()
    return res.status(200).json({ message: 'Vehicle deleted successfully' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
import { Driver } from '../models/index.js'

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll()
    return res.status(200).json({ data: drivers })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }
    return res.status(200).json({ data: driver })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const createDriver = async (req, res) => {
  try {
    const { name, license_number, phone } = req.body

    const existing = await Driver.findOne({ where: { license_number } })
    if (existing) {
      return res.status(400).json({ message: 'License number already exists' })
    }

    const driver = await Driver.create({ name, license_number, phone })
    return res.status(201).json({ message: 'Driver created successfully', data: driver })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    await driver.update(req.body)
    return res.status(200).json({ message: 'Driver updated successfully', data: driver })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    await driver.destroy()
    return res.status(200).json({ message: 'Driver deleted successfully' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
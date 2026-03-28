import { Booking, Approval, Vehicle, Driver, User } from '../models/index.js'
import sequelize from '../config/database.js'

export const createBooking = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { vehicle_id, driver_id, purpose, start_date, end_date, destination, approver_ids } = req.body

    // Validasi minimal 2 approver
    if (!approver_ids || approver_ids.length < 2) {
      return res.status(400).json({ message: 'Minimal 2 approver diperlukan' })
    }

    // Cek kendaraan tersedia
    const vehicle = await Vehicle.findByPk(vehicle_id)
    if (!vehicle || vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Kendaraan tidak tersedia' })
    }

    // Cek driver tersedia
    const driver = await Driver.findByPk(driver_id)
    if (!driver || driver.status !== 'available') {
      return res.status(400).json({ message: 'Driver tidak tersedia' })
    }

    // Buat booking
    const booking = await Booking.create({
      user_id: req.user.id,
      vehicle_id,
      driver_id,
      purpose,
      start_date,
      end_date,
      destination,
      status: 'pending'
    }, { transaction: t })

    // Buat approval berjenjang
    const approvals = approver_ids.map((approver_id, index) => ({
      booking_id: booking.id,
      approver_id,
      level: index + 1,
      status: index === 0 ? 'pending' : 'waiting' // hanya level 1 yang aktif dulu
    }))

    await Approval.bulkCreate(approvals, { transaction: t })

    // Update status kendaraan & driver
    await vehicle.update({ status: 'in_use' }, { transaction: t })
    await driver.update({ status: 'on_duty' }, { transaction: t })

    await t.commit()

    return res.status(201).json({ message: 'Booking created successfully', data: booking })
  } catch (err) {
    await t.rollback()
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
        {
          model: Approval, as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ data: bookings })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
        {
          model: Approval, as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }],
          order: [['level', 'ASC']]
        }
      ]
    })

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    return res.status(200).json({ data: booking })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
        {
          model: Approval, as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['id', 'name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ data: bookings })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const completeBooking = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const booking = await Booking.findByPk(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Hanya booking yang sudah approved yang bisa diselesaikan' })
    }

    await booking.update({ status: 'completed' }, { transaction: t })

    // Kembalikan status kendaraan & driver
    await Vehicle.update({ status: 'available' }, { where: { id: booking.vehicle_id }, transaction: t })
    await Driver.update({ status: 'available' }, { where: { id: booking.driver_id }, transaction: t })

    await t.commit()
    return res.status(200).json({ message: 'Booking completed successfully' })
  } catch (err) {
    await t.rollback()
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
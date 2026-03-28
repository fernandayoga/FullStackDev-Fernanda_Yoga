import { Booking, Vehicle, Driver, User, Approval } from '../models/index.js'
import { Op } from 'sequelize'
import sequelize from '../config/database.js'

export const getDashboardStats = async (req, res) => {
  try {
    // Total kendaraan
    const totalVehicles = await Vehicle.count()
    const availableVehicles = await Vehicle.count({ where: { status: 'available' } })
    const inUseVehicles = await Vehicle.count({ where: { status: 'in_use' } })

    // Total booking
    const totalBookings = await Booking.count()
    const pendingBookings = await Booking.count({ where: { status: 'pending' } })
    const approvedBookings = await Booking.count({ where: { status: 'approved' } })
    const rejectedBookings = await Booking.count({ where: { status: 'rejected' } })
    const completedBookings = await Booking.count({ where: { status: 'completed' } })

    // Total driver
    const totalDrivers = await Driver.count()
    const availableDrivers = await Driver.count({ where: { status: 'available' } })

    // Grafik pemakaian kendaraan per bulan (12 bulan terakhir)
    const monthlyBookings = await Booking.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('start_date')), 'month'],
        [sequelize.fn('YEAR', sequelize.col('start_date')), 'year'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: {
        start_date: {
          [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      },
      group: [
        sequelize.fn('YEAR', sequelize.col('start_date')),
        sequelize.fn('MONTH', sequelize.col('start_date'))
      ],
      order: [
        [sequelize.fn('YEAR', sequelize.col('start_date')), 'ASC'],
        [sequelize.fn('MONTH', sequelize.col('start_date')), 'ASC']
      ],
      raw: true
    })

    // Grafik pemakaian per kendaraan
    const vehicleUsage = await Booking.findAll({
      attributes: [
        'vehicle_id',
        [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'total']
      ],
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['name', 'plate_number'] }],
      group: ['vehicle_id', 'vehicle.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Booking.id')), 'DESC']],
      limit: 5
    })

    return res.status(200).json({
      data: {
        summary: {
          totalVehicles,
          availableVehicles,
          inUseVehicles,
          totalDrivers,
          availableDrivers,
          totalBookings,
          pendingBookings,
          approvedBookings,
          rejectedBookings,
          completedBookings
        },
        monthlyBookings,
        vehicleUsage
      }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
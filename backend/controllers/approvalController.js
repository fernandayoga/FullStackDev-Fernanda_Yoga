import { Approval, Booking, Vehicle, Driver } from '../models/index.js'
import sequelize from '../config/database.js'

export const processApproval = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { status, notes } = req.body // status: 'approved' | 'rejected'
    const { id } = req.params // approval id

    const approval = await Approval.findByPk(id)
    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' })
    }

    // Pastikan approver yang bener
    if (approval.approver_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda bukan approver untuk approval ini' })
    }

    // Pastikan status masih pending
    if (approval.status !== 'pending') {
      return res.status(400).json({ message: 'Approval ini sudah diproses' })
    }

    // Update approval ini
    await approval.update({ status, notes }, { transaction: t })

    const booking = await Booking.findByPk(approval.booking_id)

    if (status === 'rejected') {
      // Jika ditolak, booking langsung rejected & kembalikan kendaraan + driver
      await booking.update({ status: 'rejected' }, { transaction: t })
      await Vehicle.update({ status: 'available' }, { where: { id: booking.vehicle_id }, transaction: t })
      await Driver.update({ status: 'available' }, { where: { id: booking.driver_id }, transaction: t })

      // Batalkan semua approval yang masih waiting
      await Approval.update(
        { status: 'cancelled' },
        { where: { booking_id: booking.id, status: 'waiting' }, transaction: t }
      )
    } else if (status === 'approved') {
      // Cek apakah ada approval level berikutnya
      const nextApproval = await Approval.findOne({
        where: { booking_id: booking.id, level: approval.level + 1 },
        transaction: t
      })

      if (nextApproval) {
        // Aktifkan approval level berikutnya
        await nextApproval.update({ status: 'pending' }, { transaction: t })
      } else {
        // Semua level sudah approved → booking approved
        await booking.update({ status: 'approved' }, { transaction: t })
      }
    }

    await t.commit()
    return res.status(200).json({ message: `Approval ${status} successfully` })
  } catch (err) {
    await t.rollback()
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getMyApprovals = async (req, res) => {
  try {
    const approvals = await Approval.findAll({
      where: { approver_id: req.user.id },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: ['requester', 'vehicle', 'driver']
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ data: approvals })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
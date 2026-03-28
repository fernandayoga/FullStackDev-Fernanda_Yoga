import ExcelJS from 'exceljs'
import { Booking, Vehicle, Driver, User, Approval } from '../models/index.js'
import { Op } from 'sequelize'

export const exportBookingReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    const where = {}
    if (start_date && end_date) {
      where.start_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      }
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['name', 'email'] },
        { model: Vehicle, as: 'vehicle', attributes: ['name', 'plate_number'] },
        { model: Driver, as: 'driver', attributes: ['name', 'license_number'] },
        {
          model: Approval, as: 'approvals',
          include: [{ model: User, as: 'approver', attributes: ['name'] }],
          order: [['level', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Laporan Pemesanan Kendaraan')

    // Header styling
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Pemohon', key: 'requester', width: 20 },
      { header: 'Kendaraan', key: 'vehicle', width: 20 },
      { header: 'Plat Nomor', key: 'plate', width: 15 },
      { header: 'Driver', key: 'driver', width: 20 },
      { header: 'Tujuan', key: 'destination', width: 25 },
      { header: 'Keperluan', key: 'purpose', width: 30 },
      { header: 'Tanggal Mulai', key: 'start_date', width: 15 },
      { header: 'Tanggal Selesai', key: 'end_date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Approver 1', key: 'approver1', width: 20 },
      { header: 'Status Approval 1', key: 'approval1_status', width: 18 },
      { header: 'Approver 2', key: 'approver2', width: 20 },
      { header: 'Status Approval 2', key: 'approval2_status', width: 18 },
    ]

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    // Isi data
    bookings.forEach((booking, index) => {
      const approver1 = booking.approvals?.[0]
      const approver2 = booking.approvals?.[1]

      worksheet.addRow({
        no: index + 1,
        requester: booking.requester?.name || '-',
        vehicle: booking.vehicle?.name || '-',
        plate: booking.vehicle?.plate_number || '-',
        driver: booking.driver?.name || '-',
        destination: booking.destination,
        purpose: booking.purpose,
        start_date: new Date(booking.start_date).toLocaleDateString('id-ID'),
        end_date: new Date(booking.end_date).toLocaleDateString('id-ID'),
        status: booking.status,
        approver1: approver1?.approver?.name || '-',
        approval1_status: approver1?.status || '-',
        approver2: approver2?.approver?.name || '-',
        approval2_status: approver2?.status || '-',
      })
    })

    // Alternate row color
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowNumber % 2 === 0 ? 'FFF0F4FF' : 'FFFFFFFF' }
          }
        })
      }
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=laporan-pemesanan-${Date.now()}.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}
import { useState, useEffect } from 'react'
import api from '../api/axios'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/helpers'

const ITEMS_PER_PAGE = 10

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [approvers, setApprovers] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({
    vehicle_id: '',
    driver_id: '',
    purpose: '',
    start_date: '',
    end_date: '',
    destination: '',
    approver_ids: ['', '']
  })

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFormData = async () => {
    try {
      const [vRes, dRes, uRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/auth/users')
      ])
      setVehicles(vRes.data.data.filter(v => v.status === 'available'))
      setDrivers(dRes.data.data.filter(d => d.status === 'available'))
      setApprovers(uRes.data.data.filter(u => u.role === 'approver'))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleOpenForm = () => {
    fetchFormData()
    setForm({
      vehicle_id: '',
      driver_id: '',
      purpose: '',
      start_date: '',
      end_date: '',
      destination: '',
      approver_ids: ['', '']
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.approver_ids.some(id => !id)) {
      alert('Harap pilih semua approver')
      return
    }
    setFormLoading(true)
    try {
      await api.post('/bookings', {
        ...form,
        vehicle_id: parseInt(form.vehicle_id),
        driver_id: parseInt(form.driver_id),
        approver_ids: form.approver_ids.map(id => parseInt(id))
      })
      setShowForm(false)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat booking')
    } finally {
      setFormLoading(false)
    }
  }

  const handleComplete = async (id) => {
    if (!confirm('Tandai booking ini sebagai selesai?')) return
    try {
      await api.patch(`/bookings/${id}/complete`)
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan booking')
    }
  }

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking)
    setShowDetail(true)
  }

  // Filter & search
  const filtered = bookings.filter(b => {
    const matchSearch =
      b.requester?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.destination?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? b.status === filterStatus : true
    const matchDate = filterDate
      ? new Date(b.start_date).toISOString().slice(0, 10) === filterDate
      : true
    return matchSearch && matchStatus && matchDate
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pemesanan Kendaraan</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola semua pemesanan kendaraan</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200"
        >
          <i className="fa fa-plus"></i>
          Buat Pemesanan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Cari pemohon, kendaraan, tujuan..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(search || filterStatus || filterDate) && (
            <button
              onClick={() => { setSearch(''); setFilterStatus(''); setFilterDate(''); setPage(1) }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <i className="fa fa-times mr-1"></i> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={8} /></div>
        ) : paginated.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-car text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada data pemesanan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pemohon</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tujuan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fa fa-user text-blue-600 text-xs"></i>
                        </div>
                        <span className="font-medium text-gray-700">{booking.requester?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div>
                        <p className="font-medium text-gray-700">{booking.vehicle?.name}</p>
                        <p className="text-xs text-gray-400">{booking.vehicle?.plate_number}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-gray-600">{booking.driver?.name}</td>
                    <td className="py-4 px-5">
                      <p className="text-gray-600 max-w-36 truncate">{booking.destination}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-gray-600">{formatDate(booking.start_date)}</p>
                      <p className="text-xs text-gray-400">{formatDate(booking.end_date)}</p>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(booking)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition"
                          title="Detail"
                        >
                          <i className="fa fa-eye text-xs"></i>
                        </button>
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => handleComplete(booking.id)}
                            className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition"
                            title="Selesaikan"
                          >
                            <i className="fa fa-check text-xs"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <i className="fa fa-chevron-left text-xs"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <i className="fa fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Booking Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Buat Pemesanan Kendaraan" size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Vehicle & Driver */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa fa-car text-blue-500"></i> Pilih Kendaraan & Driver
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Kendaraan</label>
                <select
                  required
                  value={form.vehicle_id}
                  onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Pilih kendaraan</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} - {v.plate_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Driver</label>
                <select
                  required
                  value={form.driver_id}
                  onChange={e => setForm({ ...form, driver_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Pilih driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Trip Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa fa-map-marker-alt text-blue-500"></i> Informasi Perjalanan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tujuan</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan tujuan perjalanan"
                  value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Keperluan</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan keperluan perjalanan..."
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Approvers */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fa fa-check-circle text-blue-500"></i> Setup Persetujuan
            </h3>
            <div className="space-y-3">
              {form.approver_ids.map((id, index) => (
                <div key={index}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Approver Level {index + 1}
                  </label>
                  <select
                    required
                    value={id}
                    onChange={e => {
                      const newIds = [...form.approver_ids]
                      newIds[index] = e.target.value
                      setForm({ ...form, approver_ids: newIds })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Pilih approver level {index + 1}</option>
                    {approvers.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {formLoading ? <><i className="fa fa-spinner fa-spin"></i> Menyimpan...</> : <><i className="fa fa-check"></i> Submit Pemesanan</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedBooking && (
        <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Detail Pemesanan" size="lg">
          <div className="space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Pemohon', value: selectedBooking.requester?.name, icon: 'fa fa-user' },
                { label: 'Kendaraan', value: `${selectedBooking.vehicle?.name} (${selectedBooking.vehicle?.plate_number})`, icon: 'fa fa-car' },
                { label: 'Driver', value: selectedBooking.driver?.name, icon: 'fa fa-id-badge' },
                { label: 'Tujuan', value: selectedBooking.destination, icon: 'fa fa-map-marker-alt' },
                { label: 'Tanggal Mulai', value: formatDate(selectedBooking.start_date), icon: 'fa fa-calendar' },
                { label: 'Tanggal Selesai', value: formatDate(selectedBooking.end_date), icon: 'fa fa-calendar-check' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                    <i className={`${item.icon} text-blue-400`}></i> {item.label}
                  </p>
                  <p className="text-sm font-medium text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Purpose */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Keperluan</p>
              <p className="text-sm text-gray-700">{selectedBooking.purpose}</p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Status Pemesanan</p>
              <StatusBadge status={selectedBooking.status} />
            </div>

            {/* Approval Stepper */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Alur Persetujuan</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fa fa-paper-plane text-white text-xs"></i>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">Submitted</span>
                </div>
                {selectedBooking.approvals?.map((approval, i) => (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-8 h-0.5 bg-gray-200"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      approval.status === 'approved' ? 'bg-green-500' :
                      approval.status === 'rejected' ? 'bg-red-500' :
                      approval.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}>
                      <i className={`text-white text-xs fa ${
                        approval.status === 'approved' ? 'fa-check' :
                        approval.status === 'rejected' ? 'fa-times' :
                        approval.status === 'pending' ? 'fa-clock' : 'fa-minus'
                      }`}></i>
                    </div>
                    <div className="ml-1">
                      <p className="text-xs text-gray-500">Level {approval.level}</p>
                      <p className="text-xs font-medium text-gray-700">{approval.approver?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Bookings
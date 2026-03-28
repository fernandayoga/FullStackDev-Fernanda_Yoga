import { useState, useEffect } from 'react'
import api from '../api/axios'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import { formatDate } from '../utils/helpers'

const Reports = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filterStart) params.append('start_date', filterStart)
      if (filterEnd) params.append('end_date', filterEnd)

      const res = await api.get(`/reports/export?${params.toString()}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laporan-pemesanan-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Gagal export laporan')
    } finally {
      setExporting(false)
    }
  }

  const filtered = bookings.filter(b => {
    const matchSearch =
      b.requester?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.destination?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? b.status === filterStatus : true
    const matchStart = filterStart
      ? new Date(b.start_date) >= new Date(filterStart)
      : true
    const matchEnd = filterEnd
      ? new Date(b.start_date) <= new Date(filterEnd)
      : true
    return matchSearch && matchStatus && matchStart && matchEnd
  })

  const summary = {
    total: filtered.length,
    approved: filtered.filter(b => b.status === 'approved').length,
    rejected: filtered.filter(b => b.status === 'rejected').length,
    completed: filtered.filter(b => b.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Pemesanan</h1>
          <p className="text-sm text-gray-400 mt-1">Laporan periodik pemesanan kendaraan</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-green-200 disabled:opacity-60"
        >
          {exporting
            ? <><i className="fa fa-spinner fa-spin"></i> Exporting...</>
            : <><i className="fa fa-file-excel"></i> Export Excel</>
          }
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Data', value: summary.total, color: 'bg-blue-50 text-blue-600', icon: 'fa fa-list' },
          { label: 'Approved', value: summary.approved, color: 'bg-green-50 text-green-600', icon: 'fa fa-check-circle' },
          { label: 'Rejected', value: summary.rejected, color: 'bg-red-50 text-red-500', icon: 'fa fa-times-circle' },
          { label: 'Completed', value: summary.completed, color: 'bg-purple-50 text-purple-600', icon: 'fa fa-flag-checkered' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}>
              <i className={item.icon}></i>
            </div>
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Cari pemohon, kendaraan, tujuan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterStart}
              onChange={e => setFilterStart(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="date"
              value={filterEnd}
              onChange={e => setFilterEnd(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(search || filterStatus || filterStart || filterEnd) && (
            <button
              onClick={() => { setSearch(''); setFilterStatus(''); setFilterStart(''); setFilterEnd('') }}
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
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-file-alt text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada data laporan</p>
            <p className="text-xs mt-1">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">No</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pemohon</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tujuan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tgl Mulai</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tgl Selesai</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Approver 1</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Approver 2</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((booking, index) => {
                  const approver1 = booking.approvals?.[0]
                  const approver2 = booking.approvals?.[1]
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-5 text-gray-400 font-medium">{index + 1}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fa fa-user text-blue-600 text-xs"></i>
                          </div>
                          <span className="font-medium text-gray-700">{booking.requester?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-medium text-gray-700">{booking.vehicle?.name}</p>
                        <p className="text-xs text-gray-400">{booking.vehicle?.plate_number}</p>
                      </td>
                      <td className="py-4 px-5 text-gray-600">{booking.driver?.name}</td>
                      <td className="py-4 px-5 text-gray-600 max-w-32 truncate">{booking.destination}</td>
                      <td className="py-4 px-5 text-gray-600">{formatDate(booking.start_date)}</td>
                      <td className="py-4 px-5 text-gray-600">{formatDate(booking.end_date)}</td>
                      <td className="py-4 px-5">
                        <p className="text-gray-700 text-xs">{approver1?.approver?.name || '-'}</p>
                        {approver1 && <StatusBadge status={approver1.status} />}
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-gray-700 text-xs">{approver2?.approver?.name || '-'}</p>
                        {approver2 && <StatusBadge status={approver2.status} />}
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {filtered.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Total <span className="font-semibold text-gray-600">{filtered.length}</span> data
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-sm font-medium transition disabled:opacity-60"
            >
              <i className="fa fa-file-excel"></i>
              Export Excel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
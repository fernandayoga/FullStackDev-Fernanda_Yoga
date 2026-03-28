import { useState, useEffect } from 'react'
import api from '../api/axios'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const Approvals = () => {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals/my')
      setApprovals(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleOpenDetail = (approval) => {
    setSelected(approval)
    setNotes('')
    setShowDetail(true)
  }

  const handleProcess = async (status) => {
    if (!confirm(`${status === 'approved' ? 'Setujui' : 'Tolak'} pemesanan ini?`)) return
    setActionLoading(true)
    try {
      await api.patch(`/approvals/${selected.id}`, { status, notes })
      setShowDetail(false)
      fetchApprovals()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses approval')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = approvals.filter(a => {
    const matchSearch =
      a.booking?.requester?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.booking?.vehicle?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.booking?.destination?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? a.status === filterStatus : true
    return matchSearch && matchStatus
  })

  const pendingCount = approvals.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Persetujuan</h1>
          <p className="text-sm text-gray-400 mt-1">
            Kelola persetujuan pemesanan kendaraan
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl">
            <i className="fa fa-clock text-yellow-500"></i>
            <p className="text-sm font-medium text-yellow-700">
              {pendingCount} menunggu persetujuan Anda
            </p>
          </div>
        )}
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
            <option value="waiting">Waiting</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-check-circle text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada data persetujuan</p>
            <p className="text-xs mt-1">Semua persetujuan sudah diproses</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pemohon</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tujuan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(approval => (
                  <tr key={approval.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fa fa-user text-blue-600 text-xs"></i>
                        </div>
                        <span className="font-medium text-gray-700">
                          {approval.booking?.requester?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-gray-700">{approval.booking?.vehicle?.name}</p>
                      <p className="text-xs text-gray-400">{approval.booking?.vehicle?.plate_number}</p>
                    </td>
                    <td className="py-4 px-5 text-gray-600 max-w-32 truncate">
                      {approval.booking?.destination}
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-gray-600">{formatDate(approval.booking?.start_date)}</p>
                      <p className="text-xs text-gray-400">{formatDate(approval.booking?.end_date)}</p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
                        Level {approval.level}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={approval.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(approval)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition"
                          title="Detail"
                        >
                          <i className="fa fa-eye text-xs"></i>
                        </button>
                        {approval.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelected(approval); setNotes(''); handleProcess('approved') }}
                              className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition"
                              title="Setujui"
                            >
                              <i className="fa fa-check text-xs"></i>
                            </button>
                            <button
                              onClick={() => { setSelected(approval); setNotes(''); handleProcess('rejected') }}
                              className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"
                              title="Tolak"
                            >
                              <i className="fa fa-times text-xs"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          title="Detail Persetujuan"
          size="lg"
        >
          <div className="space-y-5">
            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pemohon', value: selected.booking?.requester?.name, icon: 'fa fa-user' },
                { label: 'Kendaraan', value: `${selected.booking?.vehicle?.name} (${selected.booking?.vehicle?.plate_number})`, icon: 'fa fa-car' },
                { label: 'Driver', value: selected.booking?.driver?.name, icon: 'fa fa-id-badge' },
                { label: 'Tujuan', value: selected.booking?.destination, icon: 'fa fa-map-marker-alt' },
                { label: 'Tanggal Mulai', value: formatDate(selected.booking?.start_date), icon: 'fa fa-calendar' },
                { label: 'Tanggal Selesai', value: formatDate(selected.booking?.end_date), icon: 'fa fa-calendar-check' },
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
              <p className="text-sm text-gray-700">{selected.booking?.purpose}</p>
            </div>

            {/* Approval Stepper */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Alur Persetujuan</p>
              <div className="flex items-start gap-2 overflow-x-auto pb-2">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow">
                    <i className="fa fa-paper-plane text-white text-xs"></i>
                  </div>
                  <span className="text-xs text-gray-400">Submitted</span>
                </div>
                {selected.booking?.approvals?.map((approval, i) => (
                  <div key={i} className="flex items-start gap-2 flex-shrink-0">
                    <div className="w-8 h-0.5 bg-gray-200 mt-4"></div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow ${
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
                      <span className="text-xs text-gray-500 text-center">
                        Level {approval.level}
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-20 truncate">
                        {approval.approver?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action if pending */}
            {selected.status === 'pending' && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    <i className="fa fa-comment text-blue-400 mr-1"></i>
                    Catatan (opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan persetujuan..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcess('rejected')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <i className="fa fa-times"></i> Tolak
                  </button>
                  <button
                    onClick={() => handleProcess('approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                  >
                    {actionLoading
                      ? <><i className="fa fa-spinner fa-spin"></i> Memproses...</>
                      : <><i className="fa fa-check"></i> Setujui</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Notes if already processed */}
            {selected.status !== 'pending' && selected.notes && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{selected.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Approvals
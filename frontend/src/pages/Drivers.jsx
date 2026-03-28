import { useState, useEffect } from 'react'
import api from '../api/axios'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', license_number: '', phone: ''
  })

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers')
      setDrivers(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDrivers() }, [])

  const handleOpenForm = (driver = null) => {
    if (driver) {
      setEditData(driver)
      setForm({
        name: driver.name,
        license_number: driver.license_number,
        phone: driver.phone || ''
      })
    } else {
      setEditData(null)
      setForm({ name: '', license_number: '', phone: '' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editData) {
        await api.put(`/drivers/${editData.id}`, form)
      } else {
        await api.post('/drivers', form)
      }
      setShowForm(false)
      fetchDrivers()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan driver')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus driver ini?')) return
    try {
      await api.delete(`/drivers/${id}`)
      fetchDrivers()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus driver')
    }
  }

  const filtered = drivers.filter(d => {
    const matchSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? d.status === filterStatus : true
    return matchSearch && matchStatus
  })

  const summary = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    on_duty: drivers.filter(d => d.status === 'on_duty').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Driver</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data driver perusahaan</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200"
        >
          <i className="fa fa-plus"></i> Tambah Driver
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Driver', value: summary.total, color: 'bg-blue-50 text-blue-600', icon: 'fa fa-id-badge' },
          { label: 'Tersedia', value: summary.available, color: 'bg-green-50 text-green-600', icon: 'fa fa-check-circle' },
          { label: 'Bertugas', value: summary.on_duty, color: 'bg-purple-50 text-purple-600', icon: 'fa fa-road' },
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Cari nama, SIM, atau nomor HP..."
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
            <option value="available">Tersedia</option>
            <option value="on_duty">Bertugas</option>
          </select>
          {(search || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterStatus('') }}
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
          <div className="p-6"><LoadingSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-id-badge text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada data driver</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">No. SIM</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">No. HP</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className="fa fa-user text-purple-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{driver.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono font-semibold">
                        {driver.license_number}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-600">
                      {driver.phone || (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={driver.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(driver)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition"
                          title="Edit"
                        >
                          <i className="fa fa-pen text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"
                          title="Hapus"
                        >
                          <i className="fa fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editData ? 'Edit Driver' : 'Tambah Driver'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nama Driver
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nomor SIM
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nomor SIM"
              value={form.license_number}
              onChange={e => setForm({ ...form, license_number: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nomor HP
            </label>
            <input
              type="text"
              placeholder="Masukkan nomor HP (opsional)"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              {formLoading
                ? <><i className="fa fa-spinner fa-spin"></i> Menyimpan...</>
                : <><i className="fa fa-check"></i> {editData ? 'Update' : 'Simpan'}</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Drivers
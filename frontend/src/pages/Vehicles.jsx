import { useState, useEffect } from 'react'
import api from '../api/axios'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import Modal from '../components/ui/Modal'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', plate_number: '', type: 'passenger', ownership: 'own'
  })

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles')
      setVehicles(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicles() }, [])

  const handleOpenForm = (vehicle = null) => {
    if (vehicle) {
      setEditData(vehicle)
      setForm({
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        type: vehicle.type,
        ownership: vehicle.ownership
      })
    } else {
      setEditData(null)
      setForm({ name: '', plate_number: '', type: 'passenger', ownership: 'own' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      if (editData) {
        await api.put(`/vehicles/${editData.id}`, form)
      } else {
        await api.post('/vehicles', form)
      }
      setShowForm(false)
      fetchVehicles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kendaraan')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus kendaraan ini?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      fetchVehicles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kendaraan')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/vehicles/${id}`, { status })
      fetchVehicles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status')
    }
  }

  const filtered = vehicles.filter(v => {
    const matchSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.plate_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus ? v.status === filterStatus : true
    const matchType = filterType ? v.type === filterType : true
    return matchSearch && matchStatus && matchType
  })

  const summary = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    in_use: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kendaraan</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data kendaraan perusahaan</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200"
        >
          <i className="fa fa-plus"></i> Tambah Kendaraan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summary.total, color: 'bg-blue-50 text-blue-600', icon: 'fa fa-car' },
          { label: 'Tersedia', value: summary.available, color: 'bg-green-50 text-green-600', icon: 'fa fa-check-circle' },
          { label: 'Dipakai', value: summary.in_use, color: 'bg-purple-50 text-purple-600', icon: 'fa fa-road' },
          { label: 'Maintenance', value: summary.maintenance, color: 'bg-orange-50 text-orange-600', icon: 'fa fa-wrench' },
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
              placeholder="Cari nama atau plat nomor..."
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
            <option value="in_use">Dipakai</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Tipe</option>
            <option value="passenger">Penumpang</option>
            <option value="cargo">Barang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-car text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada data kendaraan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plat Nomor</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipe</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kepemilikan</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className={`${vehicle.type === 'passenger' ? 'fa fa-car' : 'fa fa-truck'} text-blue-600`}></i>
                        </div>
                        <span className="font-medium text-gray-700">{vehicle.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono font-semibold">
                        {vehicle.plate_number}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-600 capitalize">
                      {vehicle.type === 'passenger' ? 'Penumpang' : 'Barang'}
                    </td>
                    <td className="py-4 px-5 text-gray-600 capitalize">
                      {vehicle.ownership === 'own' ? 'Milik Sendiri' : 'Sewa'}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenForm(vehicle)}
                          className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition"
                          title="Edit"
                        >
                          <i className="fa fa-pen text-xs"></i>
                        </button>
                        {vehicle.status === 'available' && (
                          <button
                            onClick={() => handleStatusUpdate(vehicle.id, 'maintenance')}
                            className="w-8 h-8 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center transition"
                            title="Set Maintenance"
                          >
                            <i className="fa fa-wrench text-xs"></i>
                          </button>
                        )}
                        {vehicle.status === 'maintenance' && (
                          <button
                            onClick={() => handleStatusUpdate(vehicle.id, 'available')}
                            className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg flex items-center justify-center transition"
                            title="Set Available"
                          >
                            <i className="fa fa-check text-xs"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(vehicle.id)}
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
        title={editData ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Kendaraan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Toyota Innova"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Plat Nomor</label>
            <input
              type="text"
              required
              placeholder="Contoh: B 1234 ABC"
              value={form.plate_number}
              onChange={e => setForm({ ...form, plate_number: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipe</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="passenger">Penumpang</option>
                <option value="cargo">Barang</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Kepemilikan</label>
              <select
                value={form.ownership}
                onChange={e => setForm({ ...form, ownership: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="own">Milik Sendiri</option>
                <option value="rent">Sewa</option>
              </select>
            </div>
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

export default Vehicles
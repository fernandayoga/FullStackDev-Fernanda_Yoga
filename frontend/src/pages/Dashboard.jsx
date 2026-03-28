import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../api/axios'
import StatCard from '../components/ui/StatCard'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import StatusBadge from '../components/ui/StatusBadge'
import { formatDate } from '../utils/helpers'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, bookingRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/bookings')
        ])
        setStats(dashRes.data.data)
        setRecentBookings(bookingRes.data.data.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const monthlyData = stats?.monthlyBookings?.map(item => ({
    name: monthNames[item.month - 1],
    total: parseInt(item.total)
  })) || []

  const vehicleUsageData = stats?.vehicleUsage?.map(item => ({
    name: item.vehicle?.name || 'Unknown',
    total: parseInt(item.total)
  })) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Ringkasan aktivitas pemesanan kendaraan</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Kendaraan"
          value={stats?.summary?.totalVehicles || 0}
          icon="fa fa-car"
          color="blue"
          subtitle={`${stats?.summary?.availableVehicles || 0} tersedia`}
        />
        <StatCard
          title="Kendaraan Dipakai"
          value={stats?.summary?.inUseVehicles || 0}
          icon="fa fa-truck"
          color="purple"
          subtitle="Sedang beroperasi"
        />
        <StatCard
          title="Pending Approval"
          value={stats?.summary?.pendingBookings || 0}
          icon="fa fa-clock"
          color="yellow"
          subtitle="Menunggu persetujuan"
        />
        <StatCard
          title="Total Pemesanan"
          value={stats?.summary?.totalBookings || 0}
          icon="fa fa-chart-line"
          color="green"
          subtitle={`${stats?.summary?.completedBookings || 0} selesai`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Pemesanan per Bulan</h2>
              <p className="text-xs text-gray-400 mt-0.5">12 bulan terakhir</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <i className="fa fa-chart-line text-blue-600"></i>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-gray-300">
              <i className="fa fa-chart-line text-4xl mb-3"></i>
              <p className="text-sm">Belum ada data</p>
            </div>
          )}
        </div>

        {/* Vehicle Usage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Pemakaian per Kendaraan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Top 5 kendaraan</p>
            </div>
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <i className="fa fa-car text-green-600"></i>
            </div>
          </div>
          {vehicleUsageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vehicleUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-gray-300">
              <i className="fa fa-car text-4xl mb-3"></i>
              <p className="text-sm">Belum ada data</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <i className="fa fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400">Approved</p>
            <p className="text-xl font-bold text-gray-800">{stats?.summary?.approvedBookings || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <i className="fa fa-times-circle text-red-500 text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400">Rejected</p>
            <p className="text-xl font-bold text-gray-800">{stats?.summary?.rejectedBookings || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <i className="fa fa-flag-checkered text-blue-600 text-xl"></i>
          </div>
          <div>
            <p className="text-xs text-gray-400">Completed</p>
            <p className="text-xl font-bold text-gray-800">{stats?.summary?.completedBookings || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Pemesanan Terbaru</h2>
            <p className="text-xs text-gray-400 mt-0.5">5 pemesanan terakhir</p>
          </div>
          <a href="/bookings" className="text-sm text-blue-600 hover:underline font-medium">
            Lihat semua
          </a>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-gray-300">
            <i className="fa fa-car text-5xl mb-3"></i>
            <p className="text-sm">Belum ada pemesanan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pemohon</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kendaraan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tujuan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fa fa-user text-blue-600 text-xs"></i>
                        </div>
                        <span className="font-medium text-gray-700">{booking.requester?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{booking.vehicle?.name}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-32 truncate">{booking.destination}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(booking.start_date)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
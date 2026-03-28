import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    if (user?.role === 'approver') {
      api.get('/approvals/my').then(res => {
        const pending = res.data.data.filter(a => a.status === 'pending')
        setPendingCount(pending.length)
      }).catch(() => {})
    } else if (user?.role === 'admin') {
      api.get('/bookings').then(res => {
        const pending = res.data.data.filter(b => b.status === 'pending')
        setPendingCount(pending.length)
      }).catch(() => {})
    }
  }, [user])

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-blue-600 text-xl"
        >
          <i className="fa fa-bars"></i>
        </button>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Selamat Datang, {user?.name} 👋
          </p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Right: notification + profile */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-50 flex items-center justify-center text-gray-500 hover:text-blue-600 transition relative"
          >
            <i className="fa fa-bell"></i>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Notifikasi</p>
              {pendingCount > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                  <i className="fa fa-clock text-yellow-500"></i>
                  <p className="text-sm text-yellow-700">
                    {pendingCount} approval menunggu tindakan
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">
                  Tidak ada notifikasi
                </p>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
            <i className="fa fa-user text-white text-xs"></i>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}

export default Topbar
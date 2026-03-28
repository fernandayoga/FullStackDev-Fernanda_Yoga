import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: 'fa fa-chart-line', label: 'Dashboard', roles: ['admin', 'approver'] },
  { to: '/bookings', icon: 'fa fa-car', label: 'Pemesanan', roles: ['admin'] },
  { to: '/approvals', icon: 'fa fa-check-circle', label: 'Persetujuan', roles: ['admin', 'approver'] },
  { to: '/vehicles', icon: 'fa fa-truck', label: 'Kendaraan', roles: ['admin'] },
  { to: '/drivers', icon: 'fa fa-id-badge', label: 'Driver', roles: ['admin'] },
  { to: '/reports', icon: 'fa fa-file-excel', label: 'Laporan', roles: ['admin'] },
  { to: '/activity', icon: 'fa fa-history', label: 'Activity Log', roles: ['admin'] },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-30
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <i className="fa fa-car text-white text-lg"></i>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">VehicleBook</p>
              <p className="text-xs text-gray-400">Mining Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`
              }
            >
              <i className={`${item.icon} w-4 text-center`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fa fa-user text-blue-600 text-xs"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
          >
            <i className="fa fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
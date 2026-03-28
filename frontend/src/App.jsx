import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Approvals from './pages/Approvals'
import Vehicles from './pages/Vehicles'
import Reports from './pages/Reports'
import ActivityLog from './pages/ActivityLog'
import Drivers from './pages/Drivers'

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><i className="fa fa-spinner fa-spin text-blue-600 text-3xl"></i></div>
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<PrivateRoute roles={['admin']}><Bookings /></PrivateRoute>} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="vehicles" element={<PrivateRoute roles={['admin']}><Vehicles /></PrivateRoute>} />
        <Route path="reports" element={<PrivateRoute roles={['admin']}><Reports /></PrivateRoute>} />
        <Route path="activity" element={<PrivateRoute roles={['admin']}><ActivityLog /></PrivateRoute>} />
        <Route path="drivers" element={<PrivateRoute roles={['admin']}><Drivers /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
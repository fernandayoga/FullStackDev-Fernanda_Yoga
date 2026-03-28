export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    available: 'bg-green-100 text-green-700',
    in_use: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-orange-100 text-orange-700',
    waiting: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-400',
    on_duty: 'bg-blue-100 text-blue-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    available: 'Tersedia',
    in_use: 'Dipakai',
    maintenance: 'Maintenance',
    waiting: 'Menunggu',
    cancelled: 'Dibatalkan',
    on_duty: 'Bertugas',
  }
  return labels[status] || status
}
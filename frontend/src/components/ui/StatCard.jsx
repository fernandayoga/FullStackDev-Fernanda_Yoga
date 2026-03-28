const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${colorMap[color] || colorMap.blue}`}>
        <i className={icon}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default StatCard
import { useState, useEffect } from 'react'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'

const ActivityLog = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `http://localhost:5000/api/logs?date=${filterDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      const data = await res.json()
      setLogs(data.data || [])
    } catch (err) {
      console.error(err)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [filterDate])

  const filtered = logs.filter(log =>
    log.toLowerCase().includes(search.toLowerCase())
  )

  const parseLog = (log) => {
    const match = log.match(/\[(.+?)\]\s(\w+)\s(.+?)\s-\sUser:\s(.+)/)
    if (match) {
      return {
        time: new Date(match[1]).toLocaleTimeString('id-ID'),
        method: match[2],
        path: match[3],
        user: match[4]
      }
    }
    return { raw: log }
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-600',
      POST: 'bg-green-100 text-green-600',
      PUT: 'bg-yellow-100 text-yellow-600',
      PATCH: 'bg-orange-100 text-orange-600',
      DELETE: 'bg-red-100 text-red-600',
    }
    return colors[method] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <p className="text-sm text-gray-400 mt-1">Riwayat aktivitas sistem</p>
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
              placeholder="Cari aktivitas, user, endpoint..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchLogs}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            <i className="fa fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <i className="fa fa-history text-blue-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Log Tanggal {filterDate}</p>
              <p className="text-xs text-gray-400">{filtered.length} aktivitas ditemukan</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={8} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-300">
            <i className="fa fa-history text-5xl mb-3"></i>
            <p className="text-sm font-medium">Tidak ada log untuk tanggal ini</p>
            <p className="text-xs mt-1">Coba pilih tanggal yang berbeda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((log, index) => {
              const parsed = parseLog(log)
              return (
                <div key={index} className="px-5 py-3.5 hover:bg-gray-50 transition flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {index < filtered.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 mt-1 flex-1 min-h-4"></div>
                    )}
                  </div>

                  {parsed.raw ? (
                    <p className="text-sm text-gray-600 font-mono">{parsed.raw}</p>
                  ) : (
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                        {parsed.time}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex-shrink-0 w-16 text-center ${getMethodColor(parsed.method)}`}>
                        {parsed.method}
                      </span>
                      <span className="text-sm text-gray-700 font-mono flex-1">
                        {parsed.path}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                          <i className="fa fa-user text-gray-400 text-xs"></i>
                        </div>
                        <span className="text-xs text-gray-500">{parsed.user}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLog
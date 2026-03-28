import { getStatusColor, getStatusLabel } from '../../utils/helpers'

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  )
}

export default StatusBadge
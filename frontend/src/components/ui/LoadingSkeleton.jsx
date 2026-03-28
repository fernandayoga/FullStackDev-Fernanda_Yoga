const LoadingSkeleton = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 rounded-xl" />
      ))}
    </div>
  )
}

export default LoadingSkeleton
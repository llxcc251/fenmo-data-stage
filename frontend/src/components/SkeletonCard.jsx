export default function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="opera-card p-4 animate-pulse">
          <div className="flex items-start justify-between mb-2">
            <div className="h-4 w-32 bg-paper-200/80 rounded" />
            <div className="h-3 w-10 bg-paper-200/80 rounded" />
          </div>
          <div className="flex gap-1 mb-2">
            <div className="h-3 w-12 bg-paper-200/80 rounded" />
            <div className="h-3 w-16 bg-paper-200/80 rounded" />
          </div>
          <div className="space-y-1 mb-3">
            <div className="h-2.5 w-full bg-paper-200/80 rounded" />
            <div className="h-2.5 w-3/4 bg-paper-200/80 rounded" />
          </div>
          <div className="h-3 w-24 bg-paper-200/80 rounded" />
        </div>
      ))}
    </div>
  )
}

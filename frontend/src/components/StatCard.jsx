import { motion } from 'framer-motion'

export default function StatCard({ label, value, sub, delay = 0, icon, onClick }) {
  const Comp = onClick ? 'button' : motion.div
  const props = onClick ? { onClick, type: 'button' } : {}
  const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`opera-card px-5 py-4 group text-left w-full ${cursorClass} hover:-translate-y-1`}
      {...props}
    >
      <div className="flex items-center gap-2 text-ink-600/60 text-xs mb-2">
        {icon && <span className="text-gold-500/50">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="font-number text-3xl text-ink-900 group-hover:text-gold-400 transition-colors duration-500">
        {value.toLocaleString()}
      </div>
      {sub && <div className="text-ink-500 text-[10px] mt-1 tracking-wider">{sub}</div>}
    </motion.div>
  )
}

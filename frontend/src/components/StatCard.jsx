import { motion } from 'framer-motion'

export default function StatCard({ label, value, sub, delay = 0, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-ink-800/60 border border-ink-600/30 rounded-lg px-5 py-4 hover:border-gold-500/30 transition-colors group"
    >
      <div className="flex items-center gap-2 text-jade-200/60 text-xs mb-2">
        {icon && <span className="text-gold-500/60">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="font-number text-3xl text-jade-100 group-hover:text-gold-400 transition-colors">
        {value.toLocaleString()}
      </div>
      {sub && <div className="text-ink-500 text-[10px] mt-1">{sub}</div>}
    </motion.div>
  )
}

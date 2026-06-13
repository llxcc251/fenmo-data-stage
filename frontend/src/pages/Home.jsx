import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {/* Stage spotlight effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, rgba(220,38,38,0.03) 30%, transparent 60%)',
        }}
      />

      {/* Decorative top curtain hints */}
      <div className="fixed top-0 left-0 right-0 h-16 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-vermillion-900/20 to-transparent" />
        <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-vermillion-900/20 to-transparent" />
        <div className="absolute top-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="space-y-8"
      >
        {/* Stage curtain separator line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-48 h-[1px] mx-auto bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-ink-500 text-sm tracking-[0.3em]"
        >
          <span className="text-vermillion-700/50 mx-2">◈</span>
          粉墨数据台
          <span className="text-vermillion-700/50 mx-2">◈</span>
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-title text-6xl text-gold-500 tracking-[0.15em] leading-relaxed"
        >
          京剧数据集
        </motion.h1>

        {/* Decorative separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="block w-12 h-[1px] bg-vermillion-700/40" />
          <span className="text-vermillion-600/40 text-xs">◆</span>
          <span className="block w-12 h-[1px] bg-gold-700/40" />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-jade-200/40 text-sm tracking-wider max-w-md mx-auto leading-relaxed"
        >
          以数据为谱，以屏幕为台，让京剧在数字空间中重新开场
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="pt-8"
        >
          <Link
            to="/overview"
            className="relative inline-block px-10 py-3 overflow-hidden group"
          >
            {/* Button border */}
            <span className="absolute inset-0 border border-gold-500/50 group-hover:border-gold-500/80 transition-colors duration-500" />
            {/* Button background hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/5 to-gold-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Corner decorations */}
            <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-gold-500/50 group-hover:border-gold-500 transition-colors duration-500" />
            <span className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t border-r border-gold-500/50 group-hover:border-gold-500 transition-colors duration-500" />
            <span className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b border-l border-gold-500/50 group-hover:border-gold-500 transition-colors duration-500" />
            <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-gold-500/50 group-hover:border-gold-500 transition-colors duration-500" />
            {/* Text */}
            <span className="relative text-gold-400 group-hover:text-gold-300 tracking-widest text-sm transition-colors duration-500">
              开 戏
            </span>
          </Link>
        </motion.div>

        {/* Bottom decorative */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-ink-600 text-[10px] tracking-[0.3em] pt-4"
        >
          1473 部剧目 · 3576 个角色 · 10 种声腔
        </motion.p>
      </motion.div>
    </div>
  )
}

import { motion } from 'framer-motion'

/**
 * Ink-drop loading animation
 */
export function InkDrop({ text = '加载中' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className="relative w-12 h-16"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: 'rgba(74, 74, 72, 0.4)' }}
          animate={{ scale: [1, 0.6, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
          style={{ background: 'rgba(74, 74, 72, 0.15)' }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.05, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <p className="text-ink-500 text-xs mt-4 tracking-widest animate-pulse">{text}</p>
    </div>
  )
}

/**
 * Error state with retry button
 */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <p className="text-vermillion-500 text-sm mb-2">◆</p>
      <p className="text-ink-500 text-sm mb-1">数据加载失败</p>
      <p className="text-ink-600 text-xs mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs text-gold-500/60 hover:text-gold-400 transition-colors">
          重新加载
        </button>
      )}
    </div>
  )
}

/**
 * Empty state
 */
export function EmptyState({ message = '暂无数据', subMessage }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <p className="text-ink-500 text-sm">{message}</p>
      {subMessage && <p className="text-ink-600 text-xs mt-1">{subMessage}</p>}
    </div>
  )
}

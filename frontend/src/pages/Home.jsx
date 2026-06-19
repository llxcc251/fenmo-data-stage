import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Three depth layers with more varied animations
function buildFaces() {
  const all = []
  let id = 0

  const r = (seed) => (((id * seed * 13 + 7) % 100) / 100)

  // Layer 1: background
  const bgCount = 25
  for (let i = 0; i < bgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 4 + r(3) * 92,
      delay: r(7) * 3,
      duration: 18 + r(11) * 12,
      size: 80 + r(5) * 60,
      opacity: 0.03 + r(13) * 0.06,
      sway: 6 + r(17) * 14,
      rotation: (r(19) - 0.5) * 40,
      filter: 'blur(3px) sepia(0.6) saturate(0.5) brightness(0.7)',
      spin: r(23) > 0.7 ? 360 : 0,
      pulse: r(29) > 0.6,
      pulseDuration: 4 + r(31) * 4,
      swayPhase: r(37) * Math.PI * 2,
      shimmer: r(41) > 0.8,
    })
    id++
  }

  // Layer 2: midground
  const mgCount = 35
  for (let i = 0; i < mgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 3 + r(3) * 94,
      delay: r(7) * 2.5,
      duration: 10 + r(11) * 8,
      size: 45 + r(5) * 40,
      opacity: 0.06 + r(13) * 0.09,
      sway: 12 + r(17) * 18,
      rotation: (r(19) - 0.5) * 25,
      filter: 'sepia(0.3) saturate(0.7) brightness(0.85)',
      spin: r(23) > 0.75 ? 360 : 0,
      pulse: r(29) > 0.55,
      pulseDuration: 3 + r(31) * 3,
      swayPhase: r(37) * Math.PI * 2,
      shimmer: r(41) > 0.75,
    })
    id++
  }

  // Layer 3: foreground
  const fgCount = 30
  for (let i = 0; i < fgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 2 + r(3) * 96,
      delay: r(7) * 1.5,
      duration: 6 + r(11) * 5,
      size: 28 + r(5) * 28,
      opacity: 0.1 + r(13) * 0.12,
      sway: 18 + r(17) * 22,
      rotation: (r(19) - 0.5) * 18,
      filter: 'none',
      spin: r(23) > 0.65 ? 360 : 0,
      pulse: r(29) > 0.5,
      pulseDuration: 2.5 + r(31) * 2.5,
      swayPhase: r(37) * Math.PI * 2,
      shimmer: r(41) > 0.7,
    })
    id++
  }

  return all
}

const faceFloaters = buildFaces()

export default function Home() {
  const navigate = useNavigate()
  const [curtainOpen, setCurtainOpen] = useState(false)

  const handleOpen = () => {
    setCurtainOpen(true)
    setTimeout(() => navigate('/overview'), 1000)
  }

  return (
    <div className="flex flex-col items-center justify-center text-center overflow-hidden relative" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {/* Floating faces */}
      {faceFloaters.map((f, i) => (
        <motion.img
          key={i}
          src={f.src}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: `${f.x}%`, width: f.size, height: f.size,
            objectFit: 'contain', filter: f.filter,
          }}
          initial={{ opacity: 0, rotate: f.rotation }}
          animate={{
            y: ['110vh', '-15vh'],
            x: [
              0,
              f.sway * 0.5 * Math.sin(f.swayPhase + 0),
              -f.sway * 0.4 * Math.sin(f.swayPhase + 1),
              f.sway * 0.3 * Math.sin(f.swayPhase + 2),
              -f.sway * 0.2 * Math.sin(f.swayPhase + 3),
              0,
            ],
            rotate: f.spin
              ? [f.rotation, f.rotation + f.spin, f.rotation + f.spin * 2, f.rotation + f.spin * 3]
              : [f.rotation, f.rotation + 2, f.rotation - 1, f.rotation + 1, f.rotation],
            scale: f.pulse ? [1, 1.08, 0.95, 1.04, 1] : [1, 1, 1, 1, 1],
            opacity: f.shimmer
              ? [f.opacity, f.opacity * 1.5, f.opacity, f.opacity * 1.3, f.opacity]
              : [f.opacity, f.opacity * 0.9, f.opacity * 1.1, f.opacity * 0.95, f.opacity],
          }}
          transition={{
            y: { duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: f.duration * 1.3, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: f.spin ? f.duration * 2 : f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' },
            scale: { duration: f.pulseDuration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: f.shimmer ? 2.5 : f.duration, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* Entry curtain — pulls apart on mount */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={curtainOpen ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-left z-20"
        style={{
          background: 'linear-gradient(to right, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
          transformOrigin: 'left',
        }}
      />
      <motion.div
        initial={{ scaleX: 1 }}
        animate={curtainOpen ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-right z-20"
        style={{
          background: 'linear-gradient(to left, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
          transformOrigin: 'right',
        }}
      />

      {/* Exit curtain — closes on click */}
      <AnimatePresence>
        {curtainOpen && (
          <>
            <motion.div
              key="exit-curtain-l"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-left z-30"
              style={{
                background: 'linear-gradient(to right, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
                transformOrigin: 'left',
              }}
            />
            <motion.div
              key="exit-curtain-r"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-right z-30"
              style={{
                background: 'linear-gradient(to left, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
                transformOrigin: 'right',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={curtainOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.6, delay: curtainOpen ? 0 : 0.8 }}
        className="space-y-10 relative z-10"
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-32 h-px mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), rgba(245,158,11,0.25), transparent)',
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-ink-500 text-xs tracking-[0.4em]"
        >
          粉墨数据台
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="space-y-2"
        >
          <h1 className="font-title text-7xl md:text-8xl text-ink-900 leading-[1.3] tracking-[0.12em]">
            京剧
          </h1>
          <h1 className="font-title text-5xl md:text-6xl text-ink-800 tracking-[0.25em] font-light">
            数据集
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="w-8 h-px" style={{ background: 'rgba(220,38,38,0.2)' }} />
          <span style={{ color: 'rgba(220,38,38,0.2)', fontSize: '8px' }}>◆</span>
          <span style={{ color: 'rgba(245,158,11,0.15)', fontSize: '8px' }}>◆</span>
          <span className="w-8 h-px" style={{ background: 'rgba(245,158,11,0.15)' }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-ink-600/60 text-sm tracking-wider max-w-sm mx-auto leading-relaxed"
        >
          以数据为谱，以屏幕为台
          <br />
          让京剧在数字空间中重新开场
        </motion.p>

        {/* CTA — seal/chop style button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="pt-4"
        >
          <button onClick={handleOpen}
            className="relative inline-flex items-center justify-center w-24 h-24 rounded-full
                       bg-white/80 border-2 border-vermillion-600/30
                       hover:bg-vermillion-600/5 hover:border-vermillion-600/50
                       transition-all duration-500 group cursor-pointer"
          >
            <span className="absolute inset-2 rounded-full border border-vermillion-600/15 group-hover:border-vermillion-600/30 transition-colors duration-500" />
            <span className="relative font-title text-2xl tracking-widest text-vermillion-600/70 group-hover:text-vermillion-600 transition-colors duration-500"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            >
              开戏
            </span>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-ink-500 text-xs tracking-[0.3em] pt-2"
        >
          1473 部剧目 · 3576 个角色 · 10 种声腔
        </motion.p>
      </motion.div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Three depth layers for aesthetic depth
function buildFaces() {
  const all = []
  let id = 0

  // Layer 1: background — large, blurry, sepia-toned, slow, drifts
  const bgCount = 25
  for (let i = 0; i < bgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 4 + Math.random() * 92,
      delay: Math.random() * 3,
      duration: 20 + Math.random() * 10,
      size: 90 + Math.random() * 50,
      opacity: 0.04 + Math.random() * 0.05,
      sway: 8 + Math.random() * 12,
      rotation: (Math.random() - 0.5) * 30,
      filter: 'blur(3px) sepia(0.6) saturate(0.6) brightness(0.8)',
      layer: 'bg',
    })
    id++
  }

  // Layer 2: midground — medium, gentle sway, warmer tone
  const mgCount = 35
  for (let i = 0; i < mgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 3 + Math.random() * 94,
      delay: Math.random() * 2.5,
      duration: 12 + Math.random() * 7,
      size: 55 + Math.random() * 35,
      opacity: 0.07 + Math.random() * 0.08,
      sway: 15 + Math.random() * 15,
      rotation: (Math.random() - 0.5) * 20,
      filter: 'sepia(0.3) saturate(0.8) brightness(0.9)',
      layer: 'mg',
    })
    id++
  }

  // Layer 3: foreground — smaller, clearer, moves faster, more visible
  const fgCount = 30
  for (let i = 0; i < fgCount; i++) {
    const idx = (id * 7 + 3) % 90
    all.push({
      src: `/faces/face_${String(idx).padStart(3, '0')}.png`,
      x: 2 + Math.random() * 96,
      delay: Math.random() * 1.5,
      duration: 7 + Math.random() * 5,
      size: 35 + Math.random() * 25,
      opacity: 0.12 + Math.random() * 0.10,
      sway: 20 + Math.random() * 20,
      rotation: (Math.random() - 0.5) * 15,
      filter: 'none',
      layer: 'fg',
    })
    id++
  }

  return all
}

const faceFloaters = buildFaces()

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center overflow-hidden relative" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {/* Floating faces — atmospheric layers with gentle drift */}
      {faceFloaters.map((f, i) => (
        <motion.img
          key={i}
          src={f.src}
          alt=""
          className="absolute pointer-events-none select-none"
          style={{
            left: `${f.x}%`, width: f.size, height: f.size,
            objectFit: 'contain', filter: f.filter, rotate: f.rotation,
          }}
          initial={{ opacity: f.opacity }}
          animate={{
            y: ['110vh', '-15vh'],
            x: [0, f.sway, -f.sway * 0.6, f.sway * 0.3, 0],
          }}
          transition={{
            y: { duration: f.duration, delay: f.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: f.duration * 1.2, delay: f.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      ))}

      {/* Curtain pull-apart */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-left z-20"
        style={{
          background: 'linear-gradient(to right, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
          transformOrigin: 'left',
        }}
      />
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 h-full pointer-events-none origin-right z-20"
        style={{
          background: 'linear-gradient(to left, #F0EBE0 0%, #E5DFD0 40%, #E5DFD0 60%, #F0EBE0 100%)',
          transformOrigin: 'right',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="space-y-10 relative z-10"
      >
        {/* Top decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-32 h-px mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), rgba(245,158,11,0.25), transparent)',
          }}
        />

        {/* Subtitle — theatrical flourish */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-ink-500 text-xs tracking-[0.4em]"
        >
          粉墨数据台
        </motion.p>

        {/* Main title — large calligraphy style */}
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

        {/* Decorative separator with diamonds */}
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

        {/* Description */}
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
          <Link to="/overview"
            className="relative inline-flex items-center justify-center w-24 h-24 rounded-full
                       bg-white/80 border-2 border-vermillion-600/30
                       hover:bg-vermillion-600/5 hover:border-vermillion-600/50
                       transition-all duration-500 group"
          >
            {/* Inner decorative ring */}
            <span className="absolute inset-2 rounded-full border border-vermillion-600/15 group-hover:border-vermillion-600/30 transition-colors duration-500" />
            {/* Text */}
            <span className="relative font-title text-2xl tracking-widest text-vermillion-600/70 group-hover:text-vermillion-600 transition-colors duration-500"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            >
              开戏
            </span>
          </Link>
        </motion.div>

        {/* Stats footer */}
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

import Navigation from './Navigation'

const dustParticles = Array.from({ length: 20 }, (_, i) => ({
  left: 5 + (i * 17 + 7) % 85,
  delay: (i * 13) % 8,
  duration: 7 + (i % 6),
}))

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen relative">
      <Navigation />
      <main className="flex-1 overflow-auto stage-curtain relative">

        {/* Ambient ink-wash blobs — constrained to main area */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ left: '14rem' }}>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-vermillion-600/5 blur-3xl animate-ink-drift-1"
            style={{ top: '-5%', left: '-5%' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-gold-500/5 blur-3xl animate-ink-drift-2"
            style={{ top: '30%', right: '-8%' }} />
          <div className="absolute w-[350px] h-[350px] rounded-full bg-indigo-500/4 blur-3xl animate-ink-drift-3"
            style={{ bottom: '10%', left: '15%' }} />
          <div className="absolute w-[450px] h-[450px] rounded-full bg-ink-600/5 blur-3xl animate-ink-drift-4"
            style={{ bottom: '-5%', right: '20%' }} />
        </div>

        {/* Floating gold dust */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ left: '14rem' }}>
          {dustParticles.map((p, i) => (
            <div key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-gold-400/30 animate-dust-float"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            left: '14rem',
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.04) 85%, rgba(0,0,0,0.08) 100%)',
          }}
        />

        {/* Curtain valance — stage drape */}
        <div className="absolute top-0 left-0 right-0 h-3 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(220,38,38,0.25) 0%, rgba(220,38,38,0.08) 40%, rgba(245,158,11,0.04) 70%, transparent 100%)'
          }}
        />
        {/* Spotlight glow at top-center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-48 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 40%, transparent 70%)'
          }}
        />
        {/* Stage wing shadows */}
        <div className="absolute top-0 left-0 w-24 h-full pointer-events-none z-0 opacity-[0.06]"
          style={{ background: 'linear-gradient(90deg, rgba(220,38,38,0.5) 0%, transparent 100%)' }}
        />
        <div className="absolute top-0 right-0 w-24 h-full pointer-events-none z-0 opacity-[0.06]"
          style={{ background: 'linear-gradient(270deg, rgba(220,38,38,0.5) 0%, transparent 100%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center py-4 text-xs text-ink-600 border-t border-ink-600/20 mt-8">
          <span className="text-vermillion-700/40 mx-2">◆</span>
          粉墨数据台
          <span className="text-vermillion-700/40 mx-2">◆</span>
        </div>
      </main>
    </div>
  )
}

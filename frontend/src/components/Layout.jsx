import Navigation from './Navigation'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto stage-curtain relative">
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
          粉墨数据台 · 中山大学 智能工程学院
          <span className="text-vermillion-700/40 mx-2">◆</span>
        </div>
      </main>
    </div>
  )
}

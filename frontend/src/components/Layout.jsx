import { useLocation } from 'react-router-dom'
import Navigation from './Navigation'

export default function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main
        key={location.pathname}
        className="flex-1 overflow-auto stage-curtain relative"
      >
        {/* Subtle spotlight overlay at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.04) 0%, transparent 70%)'
          }}
        />
        <div className={`relative z-10 max-w-7xl mx-auto p-6 ${!isHome ? 'page-content' : ''}`}>
          {children}
        </div>

        {/* Footer */}
        <div className="relative z-10 text-center py-4 text-[10px] text-ink-500 border-t border-ink-700/30 mt-8">
          <span className="text-vermillion-700/40 mx-2">◆</span>
          粉墨数据台 · 中山大学 智能工程学院
          <span className="text-vermillion-700/40 mx-2">◆</span>
        </div>
      </main>
    </div>
  )
}

import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: '开戏', sub: '数字戏台' },
  { path: '/overview', label: '数据总览', sub: '一桌二椅' },
  { path: '/roles', label: '角色之相', sub: '生旦净丑' },
  { path: '/melody', label: '声腔之流', sub: '西皮二黄' },
  { path: '/heritage', label: '传承之路', sub: '地域流派' },
  { path: '/face-generator', label: '脸谱生成', sub: '数据入谱' },
  { path: '/plays', label: '剧目之脉', sub: '宇宙图谱' },
]

export default function Navigation() {
  return (
    <nav className="w-56 shrink-0 border-r border-vermillion-900/10 bg-paper-200/60 flex flex-col relative">
      {/* Decorative top red line */}
      <div className="h-1 bg-gradient-to-r from-vermillion-900/60 via-gold-700/40 to-vermillion-900/60" />

      {/* logo */}
      <div className="px-6 pt-8 pb-6 border-b border-ink-700/50">
        <h1 className="font-title text-2xl text-gold-500 tracking-wider flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          粉墨数据台
        </h1>
        <p className="text-ink-500 text-sm mt-1 tracking-wider">京剧数据集 · 沉浸式可视化</p>
      </div>

      {/* nav items */}
      <div className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-6 py-4 text-base transition-all duration-300 group
              ${isActive
                ? 'text-gold-400 bg-gradient-to-r from-gold-500/15 to-transparent'
                : 'text-ink-600/50 hover:text-ink-800 hover:bg-ink-700/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 bg-gradient-to-b from-gold-500/80 via-vermillion-600/70 to-gold-500/80 rounded-r" />
                )}
                <span className={`font-title transition-transform duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.label}
                </span>
                <span className="text-xs text-ink-500">{item.sub}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Decorative bottom */}
      <div className="border-t border-ink-700/10 mx-6" />
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="text-vermillion-700/30">◈</span>
          中山大学 · 智慧交通
          <span className="text-vermillion-700/30">◈</span>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full" style={{
              backgroundColor: i % 2 === 0 ? 'rgba(220,38,38,0.12)' : 'rgba(245,158,11,0.12)'
            }} />
          ))}
        </div>
      </div>
    </nav>
  )
}

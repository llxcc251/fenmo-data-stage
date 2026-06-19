import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: '开戏', sub: '数字戏台', icon: '◈' },
  { path: '/overview', label: '数据总览', sub: '一桌二椅', icon: '◆' },
  { path: '/roles', label: '角色之相', sub: '生旦净丑', icon: '◇' },
  { path: '/melody', label: '声腔之流', sub: '西皮二黄', icon: '♯' },
  { path: '/heritage', label: '传承之路', sub: '地域流派', icon: '♮' },
  { path: '/face-generator', label: '脸谱生成', sub: '数据入谱', icon: '◎' },
  { path: '/plays', label: '剧目之脉', sub: '宇宙图谱', icon: '✦' },
]

export default function Navigation() {
  return (
    <nav className="w-56 shrink-0 border-r border-vermillion-900/10 bg-paper-200/60 flex flex-col relative">
      {/* Decorative top red line */}
      <div className="h-1 bg-gradient-to-r from-vermillion-900/60 via-gold-700/40 to-vermillion-900/60" />

      {/* logo */}
      <div className="px-6 pt-8 pb-6 border-b border-ink-700/50">
        <h1 className="font-title text-xl text-gold-500 tracking-wider flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          粉墨数据台
        </h1>
        <p className="text-ink-500 text-xs mt-1 tracking-wider">京剧数据集 · 沉浸式可视化</p>
      </div>

      {/* nav items */}
      <div className="flex-1 py-3 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all duration-300 group
              ${isActive
                ? 'text-gold-400 bg-gradient-to-r from-gold-500/12 to-transparent shadow-sm'
                : 'text-ink-600/50 hover:text-ink-800 hover:bg-ink-700/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator — decorative diamond */}
                {isActive && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-gradient-to-br from-gold-500/80 to-vermillion-600/60 rounded-sm" />
                )}
                {/* Icon */}
                <span className={`text-base transition-all duration-300 ${isActive ? 'text-gold-500' : 'text-ink-500/40 group-hover:text-ink-600/60'}`}>
                  {item.icon}
                </span>
                {/* Label */}
                <span className={`font-title transition-all duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>
                  {item.label}
                </span>
                {/* Subtitle — hidden by default, shown on hover/active */}
                <span className={`ml-auto text-xs transition-all duration-300
                  ${isActive ? 'text-ink-500/60 opacity-100' : 'text-ink-500/30 opacity-0 group-hover:opacity-60'}`}>
                  {item.sub}
                </span>
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
          数据戏台 · 非遗可视化
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

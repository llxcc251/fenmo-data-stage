import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: '开戏', sub: '数字戏台' },
  { path: '/overview', label: '数据总览', sub: '一桌二椅' },
  { path: '/roles', label: '角色之相', sub: '生旦净丑' },
  { path: '/melody', label: '声腔之流', sub: '西皮二黄' },
  { path: '/plays', label: '剧目之脉', sub: '宇宙图谱' },
  { path: '/heritage', label: '传承之路', sub: '地域流派' },
  { path: '/face-generator', label: '脸谱生成', sub: '数据入谱' },
]

export default function Navigation() {
  return (
    <nav className="w-56 shrink-0 border-r border-ink-600/50 bg-ink-800/80 flex flex-col">
      {/* logo */}
      <div className="px-6 pt-8 pb-6 border-b border-ink-600/50">
        <h1 className="font-title text-xl text-gold-500 tracking-wider">粉墨数据台</h1>
        <p className="text-ink-500 text-xs mt-1">京剧数据集 · 沉浸式可视化</p>
      </div>

      {/* nav items */}
      <div className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-200
              ${isActive
                ? 'text-gold-400 bg-gold-500/5 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-6 after:bg-gold-500'
                : 'text-jade-200/60 hover:text-jade-200 hover:bg-white/5'
              }`
            }
          >
            <span className="text-base">{item.label}</span>
            <span className="text-[10px] text-ink-500">{item.sub}</span>
          </NavLink>
        ))}
      </div>

      {/* footer */}
      <div className="px-6 py-4 border-t border-ink-600/50 text-[10px] text-ink-500">
        中山大学 · 智慧交通
      </div>
    </nav>
  )
}

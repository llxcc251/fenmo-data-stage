import { useEffect, useMemo, useState } from 'react'
import useStore from '../store/useStore'

const FACE_COLORS = {
  '红': { fill: '#DC2626', label: '忠勇' },
  '黑': { fill: '#171717', label: '刚直' },
  '白': { fill: '#F5F5F0', label: '奸诈' },
  '蓝': { fill: '#2563EB', label: '刚强' },
  '黄': { fill: '#D97706', label: '勇猛' },
  '紫': { fill: '#7C3AED', label: '稳重' },
  '金': { fill: '#F59E0B', label: '神佛' },
  '绿': { fill: '#16A34A', label: '暴躁' },
  '粉': { fill: '#F9A8D4', label: '年迈' },
  '灰': { fill: '#6B7280', label: '鬼怪' },
  '青': { fill: '#14B8A6', label: '骁勇' },
  '赭': { fill: '#92400E', label: '老练' },
}

const FALLBACK_COLORS = {
  '老生': '#92400E', '小生': '#EC4899', '武生': '#14B8A6', '红生': '#DC2626',
  '正生': '#1E40AF', '武老生': '#6B7280', '娃娃生': '#F9A8D4', '外': '#92400E',
  '末': '#6B7280', '童': '#F9A8D4', '生': '#6366F1',
  '正旦': '#DB2777', '花旦': '#EC4899', '老旦': '#92400E', '武旦': '#2563EB',
  '小旦': '#F9A8D4', '彩旦': '#D97706', '贴旦': '#BE185D', '丑旦': '#65A30D',
  '旦': '#EC4899',
  '净': '#171717', '二净': '#1E3A8A', '副净': '#7C3AED', '武净': '#2563EB',
  '花净': '#DC2626', '老净': '#6B7280',
  '丑': '#6B7280', '小丑': '#65A30D', '老丑': '#92400E', '武丑': '#16A34A',
  '付': '#65A30D',
}

function getRoleColor(role) {
  if (!role) return '#6B7280'
  // prefer stored faceColor
  if (role.faceColor && FACE_COLORS[role.faceColor]) {
    return FACE_COLORS[role.faceColor].fill
  }
  // fallback by type
  const fallback = FALLBACK_COLORS[role.type]
  if (fallback) return fallback
  // fallback by category
  const catFallback = { '生': '#6366F1', '旦': '#EC4899', '净': '#1E3A8A', '丑': '#6B7280' }
  return catFallback[role.category] || '#6B7280'
}

function getColorLabel(role) {
  if (!role) return '未知'
  if (role.faceColor && FACE_COLORS[role.faceColor]) {
    return `${role.faceColor} — ${FACE_COLORS[role.faceColor].label}`
  }
  return role.type
}

export default function FaceGenerator() {
  const { roles, plays, loaded, loadData } = useStore()
  const [selectedRole, setSelectedRole] = useState('')
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const coloredRoles = useMemo(() => {
    return roles.filter(r => r.type).sort((a, b) => {
      const order = ['净', '丑', '生', '旦']
      return (order.indexOf(a.category) - order.indexOf(b.category)) || (a.name.localeCompare(b.name))
    })
  }, [roles])

  const currentRole = useMemo(() => {
    if (!selectedRole) return null
    return roles.find(r => r.name === selectedRole)
  }, [selectedRole, roles])

  const rolePlays = useMemo(() => {
    if (!currentRole || !plays.length) return []
    return plays.filter(p => p.roles?.includes(currentRole.name))
  }, [currentRole, plays])

  if (!loaded) return <div className="text-ink-500 p-8">加载中...</div>

  const fc = currentRole ? getRoleColor(currentRole) : null
  const colorInfo = currentRole ? getColorLabel(currentRole) : ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl text-gold-500">数据脸谱生成器</h2>
        <p className="text-ink-500 text-xs mt-1">角色数据映射为脸谱视觉符号</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* role selector */}
        <div className="lg:col-span-1">
          <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
            <h3 className="font-title text-sm text-jade-200/60 mb-3">选择角色</h3>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-ink-700/60 border border-ink-600/30 rounded px-3 py-2 text-sm text-jade-100
                         focus:outline-none focus:border-gold-500/50 mb-3"
            >
              <option value="">-- 选择角色 --</option>
              {coloredRoles.slice(0, 200).map(r => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {coloredRoles.slice(0, 100).map(r => (
                <button
                  key={r.name}
                  onClick={() => setSelectedRole(r.name)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded transition-colors
                    ${selectedRole === r.name ? 'bg-gold-500/10 text-gold-400' : 'text-jade-200/40 hover:text-jade-200/60 hover:bg-ink-700/30'}`}
                >
                  <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                    style={{ backgroundColor: getRoleColor(r) }} />
                  {r.name}
                  <span className="text-ink-500 ml-1">({r.type})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* face display */}
        <div className="lg:col-span-2">
          {currentRole ? (
            <>
              <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-6 mb-4">
                <div className="flex items-center gap-6">
                  {/* face SVG */}
                  <div className="w-40 h-48 shrink-0">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                      {/* face outline */}
                      <ellipse cx="50" cy="55" rx="38" ry="42" fill={fc || '#666'} />
                      {/* eyes */}
                      <ellipse cx="35" cy="45" rx="8" ry="5" fill="#0A0A0A" />
                      <ellipse cx="65" cy="45" rx="8" ry="5" fill="#0A0A0A" />
                      {/* nose */}
                      <ellipse cx="50" cy="58" rx="3" ry="5" fill="#0A0A0A" opacity="0.6" />
                      {/* mouth */}
                      <path d="M35 72 Q50 82 65 72" stroke="#0A0A0A" strokeWidth="2" fill="none" />
                      {/* forehead pattern */}
                      {/* category-based forehead pattern */}
                      {currentRole.category === '丑' && (
                        <rect x="30" y="15" width="40" height="8" rx="2" fill="#0A0A0A" opacity="0.3" />
                      )}
                      {currentRole.category === '净' && (
                        <path d="M25 20 L50 10 L75 20 L75 30 L50 40 L25 30 Z" fill="#0A0A0A" opacity="0.4" />
                      )}
                      {currentRole.category === '旦' && (
                        <circle cx="50" cy="22" r="6" fill="#0A0A0A" opacity="0.2" />
                      )}
                      {currentRole.category === '生' && (
                        <rect x="35" y="18" width="30" height="4" rx="2" fill="#0A0A0A" opacity="0.2" />
                      )}
                      {/* headband */}
                      <rect x="12" y="12" width="76" height="6" rx="2" fill="#DC2626" />
                    </svg>
                  </div>
                  {/* info */}
                  <div className="space-y-2">
                    <h3 className="font-title text-xl text-gold-400">{currentRole.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-ink-700/60 rounded text-jade-200/60">{currentRole.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-ink-700/60 rounded text-jade-200/60">{currentRole.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: fc }} />
                      <span className="text-xs text-jade-200/60">脸谱色：{colorInfo}</span>
                    </div>
                    <p className="text-[10px] text-ink-500">
                      出现于 {rolePlays.length} 部剧目
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rolePlays.slice(0, 5).map(p => (
                        <span key={p.id} className="text-[10px] text-ink-500 bg-ink-700/30 px-2 py-0.5 rounded">{p.title}</span>
                      ))}
                      {rolePlays.length > 5 && <span className="text-[10px] text-ink-500">等 {rolePlays.length} 部</span>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center bg-ink-800/30 border border-ink-600/20 rounded-lg p-6" style={{ minHeight: 300 }}>
              <p className="text-ink-500 text-sm">请选择一个角色查看脸谱</p>
            </div>
          )}

          {/* legend */}
          <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
            <h3 className="font-title text-sm text-jade-200/60 mb-3">脸谱颜色寓意</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {Object.entries(FACE_COLORS).map(([color, info]) => (
                <div key={color} className="flex items-center gap-2 text-xs text-jade-200/40">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: info.fill }} />
                  <span>{color} — {info.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

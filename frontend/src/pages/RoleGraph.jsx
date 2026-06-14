import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ForceGraph from '../components/ForceGraph'
import ReactEChartsCore from 'echarts-for-react'

const CATEGORY_COLORS = { '生': '#6366F1', '旦': '#EF4444', '净': '#F59E0B', '丑': '#6B7280' }
const CATEGORIES = ['生', '旦', '净', '丑']
const DYNASTY_ORDER = ['商','周','春秋','战国','秦','汉','三国','晋','南北朝','隋','唐','五代','宋','北宋','南宋','元','明','清','历史朝代不详']

export default function RoleGraph() {
  const { plays, roles, relations, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  const [category, setCategory] = useState('生')
  const [dynasty, setDynasty] = useState('三国')
  const [tab, setTab] = useState('hangdang')
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  // Roles from plays of the selected dynasty
  const dynastyRoles = useMemo(() => {
    if (!plays.length || !roles.length) return []
    const dynastyPlayIds = new Set(plays.filter(p => p.dynasty === dynasty).map(p => p.id))
    const roleNames = new Set()
    plays.forEach(p => {
      if (dynastyPlayIds.has(p.id)) {
        Object.keys(p.roleTypes || {}).forEach(r => roleNames.add(r))
      }
    })
    return roles.filter(r => roleNames.has(r.name) && !r.generic)
  }, [plays, roles, dynasty])

  const filteredRoles = useMemo(() => {
    if (!roles.length) return []
    return roles.filter(r => r.category === category && !r.generic)
  }, [roles, category])

  const stats = useMemo(() => {
    if (!roles.length) return null
    const byCategory = { '生': 0, '旦': 0, '净': 0, '丑': 0 }
    const byType = {}
    const categoryTypes = {}
    roles.forEach(r => {
      const cat = r.category || '其他'
      if (byCategory[cat] !== undefined) byCategory[cat]++
      const tp = r.type || '未知'
      byType[tp] = (byType[tp] || 0) + 1
      if (!categoryTypes[cat]) categoryTypes[cat] = {}
      categoryTypes[cat][tp] = (categoryTypes[cat][tp] || 0) + 1
    })
    return { byCategory, byType, categoryTypes }
  }, [roles])

  const goToRole = useCallback((name) => {
    navigate(`/face-generator?role=${encodeURIComponent(name)}`)
  }, [navigate])

  if (!stats) return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {error ? (
        <>
          <p className="text-vermillion-500 text-sm mb-2">◆</p>
          <p className="text-ink-500 text-sm mb-1">数据加载失败</p>
          <p className="text-ink-600 text-[10px] mb-3">{error}</p>
          <button onClick={loadData} className="text-[10px] text-gold-500/60 hover:text-gold-400 transition-colors">重新加载</button>
        </>
      ) : (
        <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
      )}
    </div>
  )

  const sunburstData = CATEGORIES.map(cat => ({
    name: cat,
    itemStyle: { color: CATEGORY_COLORS[cat] },
    children: Object.entries(stats.categoryTypes[cat] || {})
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ name: type, value: count }))
  }))

  const sunburstOption = {
    tooltip: {
      trigger: 'item', backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 },
      formatter: (params) => {
        if (!params.treePathInfo) return `${params.name}: ${params.value}`
        const path = params.treePathInfo.map(p => p.name).filter(Boolean).join(' → ')
        return `${path}<br/>数量: ${params.value}`
      }
    },
    series: [{
      type: 'sunburst', data: sunburstData, radius: ['0%', '90%'],
      sort: 'desc', emphasis: { focus: 'descendant' },
      levels: [
        {}, { r0: '10%', r: '45%', label: { color: '#4A4A48', fontSize: 14, fontWeight: 'bold' } },
        { r0: '45%', r: '75%', label: { color: '#4A4A48', fontSize: 11 } },
      ],
      label: { rotate: 'tangential' },
      nodeClick: 'rootNode',
    }]
  }

  return (
    <div className="space-y-6">
      <div className="page-title-wrap">
        <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          角色之相
        </h2>
        <p className="text-ink-500 text-xs mt-1 ml-4">行当分布与角色类型</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-ink-700/30 pb-2">
        {[
          { key: 'hangdang', label: '行当分布' },
          { key: 'network', label: '角色同现' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-xs rounded-t transition-colors ${
              tab === t.key
                ? 'text-gold-400 bg-gold-500/10 border border-b-0 border-ink-700/30'
                : 'text-ink-600/50 hover:text-ink-600/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: 行当分布 */}
      {tab === 'hangdang' && (
        <div className="opera-card p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <ReactEChartsCore option={sunburstOption} style={{ height: 440 }} />
            </div>
            <div>
              <div className="flex gap-1 mb-3">
                {CATEGORIES.map(c => (
                  <button key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      category === c
                        ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                        : 'text-ink-600/50 border border-transparent hover:text-ink-600/70 hover:bg-paper-200/70'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto">
                {filteredRoles.length > 200 && (
                  <p className="text-ink-600 text-[10px]">前 200 个角色，共 {filteredRoles.length} 个</p>
                )}
                {filteredRoles.slice(0, 200).map(r => (
                  <button key={r.name} onClick={() => goToRole(r.name)}
                    className="w-full text-left text-xs text-ink-600/50 px-3 py-1.5 bg-paper-200/70 rounded hover:bg-paper-200/80 hover:text-gold-400 transition-colors"
                  >
                    {r.name}
                    <span className="text-ink-500 ml-1">({r.type})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 角色同现 */}
      {tab === 'network' && (
        <div className="opera-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-header text-xs text-ink-600/60">
              按朝代同现<span className="text-ink-500 ml-1">(双击查看脸谱)</span>
            </h3>
            <div className="flex gap-1">
              {DYNASTY_ORDER.filter(d => d !== '历史朝代不详' && plays.some(p => p.dynasty === d)).map(d => (
                <button key={d}
                  onClick={() => setDynasty(d)}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    dynasty === d
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                      : 'text-ink-600/50 border border-transparent hover:text-ink-600/70 hover:bg-paper-200/70'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <p className="text-ink-500 text-[10px] mb-2">
            {dynasty} · {dynastyRoles.length} 个角色，节点大小=出演剧目数，连线粗细=同台频率，颜色按行当区分
          </p>
          <ForceGraph
            selectedRoles={dynastyRoles}
            relations={relations}
            onNodeClick={goToRole}
          />
        </div>
      )}
    </div>
  )
}

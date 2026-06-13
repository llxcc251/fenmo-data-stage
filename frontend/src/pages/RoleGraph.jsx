import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ForceGraph from '../components/ForceGraph'
import ReactEChartsCore from 'echarts-for-react'

const CATEGORY_COLORS = { '生': '#6366F1', '旦': '#EF4444', '净': '#F59E0B', '丑': '#6B7280' }
const CATEGORIES = ['生', '旦', '净', '丑']

export default function RoleGraph() {
  const { roles, relations, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  const [category, setCategory] = useState('生')
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

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
      trigger: 'item', backgroundColor: '#1A1A1A', borderColor: '#3A3A3A', textStyle: { color: '#D4D4C8', fontSize: 11 },
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
        {}, { r0: '10%', r: '45%', label: { color: '#D4D4C8', fontSize: 14, fontWeight: 'bold' } },
        { r0: '45%', r: '75%', label: { color: '#D4D4C8', fontSize: 11 } },
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

      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-jade-200/50 mb-3">
          行当层级 · Sunburst<span className="text-ink-500 ml-1">(内环=四大行当，外环=子类，点击钻取)</span>
        </h3>
        <ReactEChartsCore option={sunburstOption} style={{ height: 480 }} />
      </div>

      <div className="opera-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-header text-xs text-jade-200/50">
            角色同现网络 · D3 Force<span className="text-ink-500 ml-1">(双击查看脸谱)</span>
          </h3>
          <div className="flex gap-1">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  category === c
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-jade-200/40 border border-transparent hover:text-jade-200/60 hover:bg-ink-700/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <p className="text-ink-500 text-[10px] mb-2">
          显示 {category}行 Top 50 角色同现关系
        </p>
        <ForceGraph
          selectedRoles={filteredRoles}
          relations={relations}
          onNodeClick={goToRole}
        />
      </div>

      {/* role list */}
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-jade-200/50 mb-3">
          {category}行角色列表<span className="text-ink-500 ml-1">（点击查看脸谱）</span>
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-80 overflow-y-auto">
          {filteredRoles.length > 200 && (
            <p className="col-span-full text-ink-600 text-[10px] px-1">前 200 个角色，共 {filteredRoles.length} 个（{category}行）</p>
          )}
          {filteredRoles.slice(0, 200).map(r => (
            <button
              key={r.name}
              onClick={() => goToRole(r.name)}
              className="text-xs text-jade-200/40 px-2 py-1 bg-ink-700/30 rounded hover:bg-ink-700/50 hover:text-gold-400 transition-colors text-left"
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

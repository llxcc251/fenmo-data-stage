import { useEffect, useMemo } from 'react'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'

const CATEGORY_LABELS = { '生': '生 — Male', '旦': '旦 — Female', '净': '净 — Painted Face', '丑': '丑 — Clown' }
const CATEGORY_COLORS = { '生': '#6366F1', '旦': '#EF4444', '净': '#F59E0B', '丑': '#6B7280' }

export default function RoleGraph() {
  const { roles, loaded, loadData } = useStore()
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const stats = useMemo(() => {
    if (!roles.length) return null
    const byCategory = { '生': 0, '旦': 0, '净': 0, '丑': 0 }
    const byType = {}
    roles.forEach(r => {
      const cat = r.category || '其他'
      if (byCategory[cat] !== undefined) byCategory[cat]++
      byType[r.type] = (byType[r.type] || 0) + 1
    })
    return { byCategory, byType }
  }, [roles])

  if (!stats) return <div className="text-ink-500 p-8">加载中...</div>

  const catOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: Object.entries(stats.byCategory).map(([k, v]) => ({
        name: CATEGORY_LABELS[k] || k, value: v, itemStyle: { color: CATEGORY_COLORS[k] || '#6B7280' }
      })),
      label: { color: '#D4D4C8', fontSize: 11, formatter: '{b}\n{c}' },
      labelLine: { lineStyle: { color: '#3A3A3A' } },
    }]
  }

  const typeOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 16, top: 8, bottom: 28 },
    xAxis: {
      type: 'category',
      data: Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k]) => k),
      axisLabel: { color: '#6B7280', fontSize: 10, rotate: 30 },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2A2A2A' } }, axisLabel: { color: '#6B7280' } },
    series: [{ type: 'bar', data: Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([, v]) => v), itemStyle: { color: '#6366F1' } }],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl text-gold-500">角色之相</h2>
        <p className="text-ink-500 text-xs mt-1">行当分布与角色类型</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">四大行当</h3>
          <ReactEChartsCore option={catOption} style={{ height: 280 }} />
        </div>
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">子类分布 (Top 15)</h3>
          <ReactEChartsCore option={typeOption} style={{ height: 280 }} />
        </div>
      </div>
      <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
        <h3 className="font-title text-sm text-jade-200/60 mb-3">角色列表</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-96 overflow-y-auto">
          {roles.slice(0, 200).map(r => (
            <div key={r.name} className="text-xs text-jade-200/40 px-2 py-1 bg-ink-700/30 rounded">
              {r.name}
            </div>
          ))}
        </div>
        <p className="text-ink-500 text-[10px] mt-2">显示前 200 个角色，共 {roles.length} 个</p>
      </div>
    </div>
  )
}

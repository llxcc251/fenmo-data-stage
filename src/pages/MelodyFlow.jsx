import { useEffect, useMemo } from 'react'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'

export default function MelodyFlow() {
  const { plays, melodies, loaded, loadData } = useStore()
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const data = useMemo(() => {
    if (!plays.length || !melodies.length) return null

    // Count plays per melody type
    const melodyPlayCount = {}
    melodies.forEach(m => {
      melodyPlayCount[m.name] = m.plays?.length || 0
    })

    // Count plays per pattern
    const patternCount = {}
    plays.forEach(p => {
      ;(p.patterns || []).forEach(pt => {
        patternCount[pt] = (patternCount[pt] || 0) + 1
      })
    })

    // Sankey data
    const sankeyNodes = []
    const sankeyLinks = []
    const nodeSet = new Set()

    melodies.forEach(m => {
      if (!nodeSet.has(m.name)) {
        sankeyNodes.push({ name: m.name })
        nodeSet.add(m.name)
      }
    })

    // Add patterns that have plays
    Object.entries(patternCount).forEach(([name]) => {
      if (!nodeSet.has(name)) {
        sankeyNodes.push({ name })
        nodeSet.add(name)
      }
    })

    // Link melodies to their patterns
    melodies.forEach(m => {
      ;(m.patterns || []).forEach(pt => {
        if (patternCount[pt]) {
          sankeyLinks.push({ source: m.name, target: pt, value: Math.min(patternCount[pt], 100) })
        }
      })
    })

    return { melodyPlayCount, patternCount, sankeyNodes, sankeyLinks }
  }, [plays, melodies])

  if (!data) return <div className="text-ink-500 p-8">加载中...</div>

  const sankeyOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'sankey', layout: 'none',
      data: data.sankeyNodes,
      links: data.sankeyLinks,
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { color: '#D4D4C8', fontSize: 10 },
      nodeStyle: { borderColor: 'transparent' },
      levels: [
        { depth: 0, itemStyle: { color: '#F59E0B' } },
        { depth: 1, itemStyle: { color: '#6366F1' } },
      ],
    }],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl text-gold-500">声腔之流</h2>
        <p className="text-ink-500 text-xs mt-1">声腔类别与板式分布</p>
      </div>

      {/* melody cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {melodies.map(m => (
          <div key={m.name} className="bg-ink-800/60 border border-ink-600/30 rounded-lg p-4 text-center">
            <div className="font-title text-gold-500 mb-1">{m.name}</div>
            <div className="font-number text-2xl text-jade-100">{(m.plays?.length || 0).toLocaleString()}</div>
            <div className="text-ink-500 text-[10px] mt-1">剧目</div>
          </div>
        ))}
      </div>

      {/* sankey */}
      <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
        <h3 className="font-title text-sm text-jade-200/60 mb-3">声腔 → 板式 流向</h3>
        <ReactEChartsCore option={sankeyOption} style={{ height: 300 }} />
      </div>
    </div>
  )
}

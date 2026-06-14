import { useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'

export default function MelodyFlow() {
  const { plays, melodies, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const data = useMemo(() => {
    if (!plays.length || !melodies.length) return null
    const melodyPlayCount = {}
    melodies.forEach(m => { melodyPlayCount[m.name] = m.plays?.length || 0 })
    const patternCount = {}
    plays.forEach(p => { ;(p.patterns || []).forEach(pt => { patternCount[pt] = (patternCount[pt] || 0) + 1 }) })
    const sankeyNodes = []
    const sankeyLinks = []
    const nodeSet = new Set()
    melodies.forEach(m => {
      if (!nodeSet.has(m.name)) { sankeyNodes.push({ name: m.name }); nodeSet.add(m.name) }
    })
    Object.entries(patternCount).forEach(([name]) => {
      if (!nodeSet.has(name)) { sankeyNodes.push({ name }); nodeSet.add(name) }
    })
    melodies.forEach(m => {
      ;(m.patterns || []).forEach(pt => {
        if (patternCount[pt]) sankeyLinks.push({ source: m.name, target: pt, value: patternCount[pt] })
      })
    })
    return { melodyPlayCount, patternCount, sankeyNodes, sankeyLinks }
  }, [plays, melodies])

  const sankeyClick = useCallback((params) => {
    if (!params.name) return
    if (melodies.some(m => m.name === params.name)) {
      navigate(`/plays?melody=${encodeURIComponent(params.name)}`)
    }
  }, [navigate, melodies])

  if (!data) return (
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

  const sankeyOption = {
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { trigger: 'item', formatter: (p) => `${p.data.source || p.name} → ${p.data.target || ''} ${p.value} 部剧目`, backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    series: [{
      type: 'sankey', layout: 'none',
      data: data.sankeyNodes,
      links: data.sankeyLinks,
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { color: '#4A4A48', fontSize: 10 },
      nodeStyle: { borderColor: 'transparent' },
      levels: [
        { depth: 0, itemStyle: { color: '#DC2626' } },
        { depth: 1, itemStyle: { color: '#6366F1' } },
      ],
    }],
  }

  return (
    <div className="space-y-6">
      <div className="page-title-wrap">
        <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          声腔之流
        </h2>
        <p className="text-ink-500 text-xs mt-1 ml-4">声腔类别与板式分布</p>
      </div>

      {/* melody cards - clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {melodies.map((m, i) => (
          <button
            key={m.name}
            onClick={() => navigate(`/plays?melody=${encodeURIComponent(m.name)}`)}
            className="opera-card p-4 text-center group w-full"
          >
            <div className="font-title text-gold-500 mb-1 text-sm group-hover:text-gold-400 transition-colors">{m.name}</div>
            <div className="font-number text-2xl text-ink-900">{(m.plays?.length || 0).toLocaleString()}</div>
            <div className="text-ink-500 text-[10px] mt-1">剧目</div>
          </button>
        ))}
      </div>

      {/* sankey */}
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-ink-600/60 mb-3">声腔 → 板式 流向</h3>
        <div className="w-full" style={{ aspectRatio: '16/9', minHeight: 260 }}>
          <ReactEChartsCore option={sankeyOption} style={{ width: '100%', height: '100%' }} onEvents={{ click: sankeyClick }} />
        </div>
      </div>
    </div>
  )
}

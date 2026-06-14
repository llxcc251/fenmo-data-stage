import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'
import { DYNASTY_ORDER } from '../constants'

export default function HeritageMap() {
  const { plays, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  const [brushedDynasties, setBrushedDynasties] = useState(null)
  const [zoomRange, setZoomRange] = useState({ start: 0, end: 100 })
  const timelineRef = useRef(null)
  const zoomingRef = useRef(false)

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const fullData = useMemo(() => {
    if (!plays.length) return null
    const sourceCount = {}
    plays.forEach(p => {
      const s = p.source || '未标注来源'
      sourceCount[s] = (sourceCount[s] || 0) + 1
    })
    const dynastyTimeline = DYNASTY_ORDER.map(d => ({
      name: d, value: plays.filter(p => p.dynasty === d).length
    })).filter(d => d.value > 0)
    return { sourceCount, dynastyTimeline }
  }, [plays])

  const data = useMemo(() => {
    if (!fullData) return null
    if (!brushedDynasties) return fullData
    const dynastySet = new Set(brushedDynasties)
    const filteredPlays = plays.filter(p => dynastySet.has(p.dynasty))
    const sourceCount = {}
    filteredPlays.forEach(p => {
      const s = p.source || '未标注来源'
      sourceCount[s] = (sourceCount[s] || 0) + 1
    })
    return { sourceCount, dynastyTimeline: fullData.dynastyTimeline.filter(d => dynastySet.has(d.name)) }
  }, [fullData, brushedDynasties, plays])

  // datazoom event: read actual zoom from chart, store it
  const onEvents = useMemo(() => ({
    datazoom: () => {
      if (!fullData || !timelineRef.current) return
      const echarts = timelineRef.current.getEchartsInstance()
      const opt = echarts.getOption()
      const zoom = opt.dataZoom?.[0]
      if (!zoom) return
      const start = zoom.start ?? 0
      const end = zoom.end ?? 100

      // Update zoom range (same value check to avoid re-render loops)
      setZoomRange(prev => {
        if (prev.start === start && prev.end === end) return prev
        return { start, end }
      })

      // Compute brushed dynasties
      const total = fullData.dynastyTimeline.length
      if (total === 0) { setBrushedDynasties(null); return }
      const startIdx = Math.floor(start / 100 * total)
      const endIdx = Math.ceil(end / 100 * total) - 1
      if (start <= 0 && end >= 100) {
        setBrushedDynasties(null)
      } else {
        const selected = fullData.dynastyTimeline.slice(startIdx, endIdx + 1).map(d => d.name)
        setBrushedDynasties(selected)
      }
    }
  }), [fullData])

  const timelineClick = useCallback((params) => {
    const dynasty = params.name
    if (dynasty) navigate(`/plays?dynasty=${encodeURIComponent(dynasty)}`)
  }, [navigate])

  // Memoized timeline option — depends on zoomRange so slider stays in sync
  const timelineOption = useMemo(() => fullData ? ({
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    grid: { left: 40, right: 16, top: 8, bottom: 48 },
    xAxis: {
      type: 'category',
      data: fullData.dynastyTimeline.map(d => d.name),
      axisLabel: { color: '#6B6B68', fontSize: 10 },
      axisLine: { lineStyle: { color: '#D5CEBC' } },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#E5DFD0' } }, axisLabel: { color: '#6B6B68' } },
    dataZoom: [{
      type: 'slider', show: true,
      start: zoomRange.start, end: zoomRange.end,
      bottom: 0, height: 20,
      borderColor: '#D5CEBC', backgroundColor: '#FFFFFD',
      fillerColor: 'rgba(245, 158, 11, 0.15)',
      handleStyle: { color: '#F59E0B' },
      textStyle: { color: '#6B6B68', fontSize: 9 },
      labelFormatter: (v) => fullData.dynastyTimeline[Math.round(v / 100 * (fullData.dynastyTimeline.length - 1))]?.name || '',
    }],
    series: [{
      type: 'line', smooth: true,
      data: fullData.dynastyTimeline.map(d => d.value),
      lineStyle: { color: '#F59E0B', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.3)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } },
      itemStyle: { color: '#F59E0B', cursor: 'pointer' },
      symbol: 'circle', symbolSize: 8,
    }],
  }) : null, [fullData, zoomRange])

  // Genre-by-dynasty heatmap data
  const genreHeatmapData = useMemo(() => {
    if (!plays.length) return null
    const dg = {}
    plays.forEach(p => {
      const d = p.dynasty || '未知'
      if (!dg[d]) dg[d] = {}
      ;(p.genres || ['其他']).forEach(g => { dg[d][g] = (dg[d][g] || 0) + 1 })
    })
    // Top dynasties (filtered by brush if active)
    let topDyns = Object.keys(dg).sort((a, b) => {
      const order = DYNASTY_ORDER
      return (order.indexOf(a) !== -1 ? order.indexOf(a) : 99) - (order.indexOf(b) !== -1 ? order.indexOf(b) : 99)
    }).filter(d => d !== '神话')
    if (brushedDynasties) topDyns = topDyns.filter(d => brushedDynasties.includes(d))
    // Top genres across all dynasties
    const genreTotal = {}
    Object.values(dg).forEach(gd => {
      Object.entries(gd).forEach(([g, c]) => { genreTotal[g] = (genreTotal[g] || 0) + c })
    })
    const topGenres = Object.entries(genreTotal).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([g]) => g)

    const heatData = []
    topDyns.forEach((d, di) => {
      topGenres.forEach((g, gi) => {
        heatData.push([di, gi, dg[d][g] || 0])
      })
    })
    return { dyns: topDyns, genres: topGenres, data: heatData }
  }, [plays, brushedDynasties])

  // Heatmap option
  const heatmapOption = useMemo(() => {
    if (!genreHeatmapData) return null
    const maxV = Math.max(...genreHeatmapData.data.map(d => d[2]))
    return {
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      tooltip: {
        position: 'top',
        backgroundColor: '#FFFFFD', borderColor: '#D5CEBC',
        textStyle: { color: '#4A4A48', fontSize: 11 },
        formatter: (p) => `${genreHeatmapData.genres[p.value[1]]} · ${genreHeatmapData.dyns[p.value[0]]}<br/>${p.value[2]} 部`,
      },
      grid: { left: 80, right: 40, top: 8, bottom: 40 },
      xAxis: { type: 'category', data: genreHeatmapData.dyns, axisLabel: { color: '#6B6B68', fontSize: 9 }, axisLine: { lineStyle: { color: '#D5CEBC' } }, splitArea: { show: true } },
      yAxis: { type: 'category', data: genreHeatmapData.genres, axisLabel: { color: '#6B6B68', fontSize: 9 }, axisLine: { lineStyle: { color: '#D5CEBC' } }, splitArea: { show: true } },
      visualMap: { min: 0, max: maxV, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#FAF7F0', '#F59E0B', '#DC2626'] }, textStyle: { color: '#6B6B68', fontSize: 9 } },
      series: [{ type: 'heatmap', data: genreHeatmapData.data, label: { show: true, color: '#4A4A48', fontSize: 8 }, emphasis: { itemStyle: { shadowBlur: 10 } } }],
    }
  }, [genreHeatmapData])

  if (!timelineOption) return (
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

  const resetBrush = () => {
    setBrushedDynasties(null)
    setZoomRange({ start: 0, end: 100 })
    if (timelineRef.current) {
      const echarts = timelineRef.current.getEchartsInstance()
      echarts.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-title-wrap">
        <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          传承之路
        </h2>
        <p className="text-ink-500 text-xs mt-1 ml-4">剧目来源与时代脉络</p>
      </div>

      {brushedDynasties && (
        <div className="opera-card p-3 flex items-center justify-between">
          <p className="text-ink-500 text-[10px]">
            筛选朝代：<span className="text-gold-400">{brushedDynasties.join(' · ')}</span>
          </p>
          <button onClick={resetBrush} className="text-[10px] text-ink-600/50 hover:text-ink-600/70 transition-colors">
            重置筛选
          </button>
        </div>
      )}

      {/* Row 1: Timeline full width */}
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-ink-600/60 mb-3">
          剧目时代趋势<span className="text-ink-500 ml-1">（点击朝代查看剧目 · 拖拽滑块刷选）</span>
        </h3>
        <div className="w-full" style={{ aspectRatio: '21/9', minHeight: 240 }}>
          <ReactEChartsCore
            ref={timelineRef}
            option={timelineOption}
            style={{ width: '100%', height: '100%' }}
            onEvents={{ ...onEvents, click: timelineClick }}
          />
        </div>
      </div>

      {/* Row 2: Heatmap full width */}
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-ink-600/60 mb-3">题材 x 朝代 热度</h3>
        <div className="w-full" style={{ aspectRatio: '16/9', minHeight: 260 }}>
          <ReactEChartsCore option={heatmapOption} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  )
}

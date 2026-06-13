import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'

const SOURCE_COLORS = {
  '振飞曲谱': '#6366F1', '关羽戏集：李洪春演出本': '#EF4444',
  '侯玉山昆曲谱': '#F59E0B', '汪笑侬戏曲集': '#8B5CF6',
  '程砚秋演出剧本选集': '#EC4899', '唐韵笙舞台艺术集': '#14B8A6',
  '萧长华演出剧本选集': '#F97316', '梅兰芳演出剧本选集': '#DC2626',
  '周信芳演出剧本新编': '#0EA5E9',
}

const DYNASTY_ORDER = ['商', '周', '春秋', '战国', '秦', '汉', '三国', '晋', '南北朝',
                       '隋', '唐', '五代', '宋', '元', '明', '清']

export default function HeritageMap() {
  const { plays, loaded, loadData } = useStore()
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
    tooltip: { trigger: 'axis', backgroundColor: '#1A1A1A', borderColor: '#3A3A3A', textStyle: { color: '#D4D4C8', fontSize: 11 } },
    grid: { left: 40, right: 16, top: 8, bottom: 48 },
    xAxis: {
      type: 'category',
      data: fullData.dynastyTimeline.map(d => d.name),
      axisLabel: { color: '#6B7280', fontSize: 10 },
      axisLine: { lineStyle: { color: '#3A3A3A' } },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2A2A2A' } }, axisLabel: { color: '#6B7280' } },
    dataZoom: [{
      type: 'slider', show: true,
      start: zoomRange.start, end: zoomRange.end,
      bottom: 0, height: 20,
      borderColor: '#3A3A3A', backgroundColor: '#1A1A1A',
      fillerColor: 'rgba(245, 158, 11, 0.15)',
      handleStyle: { color: '#F59E0B' },
      textStyle: { color: '#6B7280', fontSize: 9 },
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

  const sourceOption = useMemo(() => data ? ({
    tooltip: { trigger: 'item', backgroundColor: '#1A1A1A', borderColor: '#3A3A3A', textStyle: { color: '#D4D4C8', fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['20%', '50%'],
      data: Object.entries(data.sourceCount)
        .filter(([k]) => k !== '未标注来源')
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ name: k, value: v, itemStyle: { color: SOURCE_COLORS[k] || '#6B7280' } })),
      label: { color: '#D4D4C8', fontSize: 10 },
      labelLine: { lineStyle: { color: '#3A3A3A' } },
    }],
  }) : null, [data])

  if (!data || !timelineOption) return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
    </div>
  )

  const labeledTotal = Object.entries(data.sourceCount)
    .filter(([k]) => k !== '未标注来源')
    .reduce((s, [, v]) => s + v, 0)
  const unlabeledTotal = data.sourceCount['未标注来源'] || 0

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
          <button onClick={resetBrush} className="text-[10px] text-jade-200/40 hover:text-jade-200/60 transition-colors">
            重置筛选
          </button>
        </div>
      )}

      <div className="opera-card p-3 flex items-center gap-2">
        <span className="text-vermillion-600/60 text-xs">◈</span>
        <p className="text-ink-500 text-[10px]">
          数据集共 <span className="text-jade-200/60">{plays.length}</span> 部剧本，
          其中 <span className="text-jade-200/60">{unlabeledTotal}</span> 部未记录来源，
          仅 <span className="text-gold-400">{labeledTotal}</span> 部归属明确流派整理本
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="opera-card p-4">
          <h3 className="section-header text-xs text-jade-200/50 mb-3">
            剧目时代趋势<span className="text-ink-500 ml-1">（点击朝代查看剧目 · 拖拽滑块刷选）</span>
          </h3>
          <ReactEChartsCore
            ref={timelineRef}
            option={timelineOption}
            style={{ height: 280 }}
            onEvents={{ ...onEvents, click: timelineClick }}
          />
        </div>
        <div className="opera-card p-4">
          <h3 className="section-header text-xs text-jade-200/50 mb-3">
            剧本来源{brushedDynasties ? '（已筛选）' : ''}
          </h3>
          <ReactEChartsCore option={sourceOption} style={{ height: 240 }} />
        </div>
      </div>

      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-jade-200/50 mb-3">
          重要流派整理本{brushedDynasties ? '（已筛选）' : ''}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(data.sourceCount)
            .filter(([k]) => k !== '未标注来源')
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className="flex items-center justify-between bg-ink-700/30 rounded px-3 py-2 hover:bg-ink-700/50 transition-colors">
                <span className="text-xs text-jade-200/60">{name}</span>
                <span className="font-number text-gold-400 text-xs ml-2">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

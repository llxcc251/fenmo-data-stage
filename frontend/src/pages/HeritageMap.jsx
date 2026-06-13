import { useEffect, useMemo } from 'react'
import useStore from '../store/useStore'
import ReactEChartsCore from 'echarts-for-react'

const SOURCE_COLORS = {
  '振飞曲谱': '#6366F1', '关羽戏集：李洪春演出本': '#EF4444',
  '侯玉山昆曲谱': '#F59E0B', '汪笑侬戏曲集': '#8B5CF6',
  '程砚秋演出剧本选集': '#EC4899', '唐韵笙舞台艺术集': '#14B8A6',
  '萧长华演出剧本选集': '#F97316', '梅兰芳演出剧本选集': '#DC2626',
  '周信芳演出剧本新编': '#0EA5E9',
}

export default function HeritageMap() {
  const { plays, loaded, loadData } = useStore()
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const data = useMemo(() => {
    if (!plays.length) return null

    // Source distribution
    const sourceCount = {}
    plays.forEach(p => {
      const s = p.source || '未标注来源'
      sourceCount[s] = (sourceCount[s] || 0) + 1
    })

    // Dynasty timeline (plays per dynasty)
    const dynastyOrder = ['商', '周', '春秋', '战国', '秦', '汉', '三国', '晋', '南北朝',
                         '隋', '唐', '五代', '宋', '元', '明', '清']
    const dynastyTimeline = dynastyOrder.map(d => ({
      name: d, value: plays.filter(p => p.dynasty === d).length
    })).filter(d => d.value > 0)

    return { sourceCount, dynastyTimeline }
  }, [plays])

  if (!data) return <div className="text-ink-500 p-8">加载中...</div>

  const timelineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 8, bottom: 28 },
    xAxis: {
      type: 'category',
      data: data.dynastyTimeline.map(d => d.name),
      axisLabel: { color: '#6B7280', fontSize: 10 },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2A2A2A' } }, axisLabel: { color: '#6B7280' } },
    series: [{
      type: 'line', smooth: true,
      data: data.dynastyTimeline.map(d => d.value),
      lineStyle: { color: '#F59E0B', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.3)' }, { offset: 1, color: 'rgba(245,158,11,0)' }] } },
      itemStyle: { color: '#F59E0B' },
      symbol: 'circle', symbolSize: 6,
    }],
  }

  const sourceOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['20%', '50%'],
      data: Object.entries(data.sourceCount)
        .filter(([k]) => k !== '未标注来源')
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ name: k, value: v, itemStyle: { color: SOURCE_COLORS[k] || '#6B7280' } })),
      label: { color: '#D4D4C8', fontSize: 10 },
      labelLine: { lineStyle: { color: '#3A3A3A' } },
    }],
  }

  const labeledTotal = Object.entries(data.sourceCount)
    .filter(([k]) => k !== '未标注来源')
    .reduce((s, [, v]) => s + v, 0)
  const unlabeledTotal = data.sourceCount['未标注来源'] || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl text-gold-500">传承之路</h2>
        <p className="text-ink-500 text-xs mt-1">剧目来源与时代脉络</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">剧目时代趋势</h3>
          <ReactEChartsCore option={timelineOption} style={{ height: 280 }} />
        </div>
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">剧本来源</h3>
          <p className="text-ink-500 text-[10px] mb-3">
            数据集共 {plays.length} 部剧本，其中 {unlabeledTotal} 部未记录来源，
            仅 {labeledTotal} 部归属明确流派整理本，分布如下：
          </p>
          <ReactEChartsCore option={sourceOption} style={{ height: 240 }} />
        </div>
      </div>

      {/* school highlights */}
      <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
        <h3 className="font-title text-sm text-jade-200/60 mb-3">重要流派整理本</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(data.sourceCount)
            .filter(([k]) => k !== '未标注来源')
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className="flex items-center justify-between bg-ink-700/30 rounded px-4 py-2">
                <span className="text-xs text-jade-200/60">{name}</span>
                <span className="font-number text-gold-400 text-xs">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

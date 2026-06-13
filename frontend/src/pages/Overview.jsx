import { useEffect, useMemo } from 'react'
import useStore from '../store/useStore'
import StatCard from '../components/StatCard'
import ReactEChartsCore from 'echarts-for-react'

export default function Overview() {
  const { plays, roles, melodies, relations, loaded, loading, loadData } = useStore()

  useEffect(() => {
    if (!loaded) loadData()
  }, [loaded, loadData])

  // Compute stats
  const stats = useMemo(() => {
    if (!plays.length) return null

    const dynastyCount = {}
    const genreCount = {}
    const roleTypeCount = {}

    plays.forEach(p => {
      const d = p.dynasty || '未知'
      dynastyCount[d] = (dynastyCount[d] || 0) + 1

      ;(p.genres || ['其他']).forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1
      })

      Object.values(p.roleTypes || {}).forEach(rt => {
        roleTypeCount[rt] = (roleTypeCount[rt] || 0) + 1
      })
    })

    return {
      totalPlays: plays.length,
      totalRoles: roles.length,
      totalRelations: relations.length,
      totalMelodies: melodies.length,
      uniqueRoleTypes: Object.keys(roleTypeCount).length,
      uniqueDynasties: Object.keys(dynastyCount).length,
      dynastyCount,
      genreCount,
      roleTypeCount,
    }
  }, [plays, roles, melodies, relations])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <p className="text-ink-500 animate-pulse">加载数据中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <p className="text-ink-500">无数据</p>
      </div>
    )
  }

  // ECharts options
  const dynastyOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, top: 8, bottom: 28 },
    xAxis: {
      type: 'category',
      data: Object.keys(stats.dynastyCount),
      axisLabel: { color: '#6B7280', fontSize: 10 },
      axisLine: { lineStyle: { color: '#3A3A3A' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#2A2A2A' } },
      axisLabel: { color: '#6B7280', fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: Object.values(stats.dynastyCount),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#F59E0B' },
            { offset: 1, color: '#D97706' },
          ]
        },
        borderRadius: [2, 2, 0, 0],
      },
    }],
  }

  const genreOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['50%', '50%'],
      data: Object.entries(stats.genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value })),
      label: {
        color: '#D4D4C8',
        fontSize: 10,
        formatter: '{b}: {d}%',
      },
      labelLine: { lineStyle: { color: '#3A3A3A' } },
      itemStyle: {
        borderRadius: 4,
      },
      color: ['#F59E0B', '#DC2626', '#6366F1', '#6B7280', '#EF4444', '#FBBF24', '#818CF8', '#D4D4C8'],
    }],
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h2 className="font-title text-2xl text-gold-500">数据总览</h2>
        <p className="text-ink-500 text-xs mt-1">京剧数据集整体规模一览</p>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="剧目总数" value={stats.totalPlays} sub="台本" delay={0} />
        <StatCard label="角色总数" value={stats.totalRoles} sub="人物" delay={0.05} />
        <StatCard label="角色关系" value={stats.totalRelations} sub="关联" delay={0.1} />
        <StatCard label="声腔类型" value={stats.totalMelodies} sub="西皮二黄等" delay={0.15} />
        <StatCard label="行当种类" value={stats.uniqueRoleTypes} sub="生旦净丑" delay={0.2} />
        <StatCard label="历史朝代" value={stats.uniqueDynasties} sub="时间跨度" delay={0.25} />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">朝代分布</h3>
          <ReactEChartsCore option={dynastyOption} style={{ height: 200 }} />
        </div>
        <div className="bg-ink-800/30 border border-ink-600/20 rounded-lg p-4">
          <h3 className="font-title text-sm text-jade-200/60 mb-3">题材分布</h3>
          <ReactEChartsCore option={genreOption} style={{ height: 200 }} />
        </div>
      </div>
    </div>
  )
}

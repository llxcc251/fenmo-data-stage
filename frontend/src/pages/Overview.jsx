import { useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import StatCard from '../components/StatCard'
import ReactEChartsCore from 'echarts-for-react'
import 'echarts-wordcloud'

export default function Overview() {
  const { plays, roles, melodies, relations, loaded, loading, error, loadData } = useStore()
  const navigate = useNavigate()

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const stats = useMemo(() => {
    if (!plays.length) return null
    const dynastyCount = {}
    const genreCount = {}
    const roleTypeCount = {}
    plays.forEach(p => {
      const d = p.dynasty || '历史朝代不详'
      dynastyCount[d] = (dynastyCount[d] || 0) + 1
      ;(p.genres || ['其他']).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1 })
      Object.entries(p.roleTypes || {}).forEach(([name, rt]) => {
        if (!roles.find(r => r.name === name)?.generic) {
          roleTypeCount[rt] = (roleTypeCount[rt] || 0) + 1
        }
      })
    })
    // Coverage: how many plays have each field populated
    const withDynasty = plays.filter(p => p.dynasty && p.dynasty !== '历史朝代不详').length
    const withGenre = plays.filter(p => p.genres && p.genres.length > 0).length
    const withPlot = plays.filter(p => p.plot).length
    const withMelody = plays.filter(p => p.melodies && p.melodies.length > 0).length
    // Role type ranking (from roles[], not plays)
    const roleTypeRank = {}
    roles.forEach(r => {
      if (r.type) roleTypeRank[r.type] = (roleTypeRank[r.type] || 0) + 1
    })
    return {
      totalPlays: plays.length, totalRoles: roles.length,
      totalRelations: relations.length, totalMelodies: melodies.length,
      uniqueRoleTypes: Object.keys(roleTypeCount).length,
      uniqueDynasties: Object.keys(dynastyCount).length,
      dynastyCount, genreCount,
      coverage: [
        { label: '朝代', count: withDynasty, pct: Math.round(withDynasty / plays.length * 100) },
        { label: '题材', count: withGenre, pct: Math.round(withGenre / plays.length * 100) },
        { label: '剧情摘要', count: withPlot, pct: Math.round(withPlot / plays.length * 100) },
        { label: '声腔', count: withMelody, pct: Math.round(withMelody / plays.length * 100) },
      ],
      topRoleTypes: Object.entries(roleTypeRank).sort((a, b) => b[1] - a[1]).slice(0, 10),
    }
  }, [plays, roles, melodies, relations])

  // Word cloud data: role names sized by play frequency
  const WORD_CLOUD_COLORS = ['#F59E0B', '#DC2626', '#6366F1', '#14B8A6', '#EC4899', '#D4D4C8', '#6B7280']
  const wordCloudData = useMemo(() => {
    if (!roles.length) return []
    return roles
      .filter(r => !r.generic && r.name.length <= 6)
      .map(r => ({ name: r.name, value: r.plays?.length || 1 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 180)
      .map((item, i) => ({ ...item, textStyle: { color: WORD_CLOUD_COLORS[i % WORD_CLOUD_COLORS.length] } }))
  }, [roles])

  const wordCloudClick = useCallback((params) => {
    const role = params.name
    if (role) navigate(`/face-generator?role=${encodeURIComponent(role)}`)
  }, [navigate])

  const dynastyClick = useCallback((params) => {
    const dynasty = params.name
    if (dynasty) navigate(`/plays?dynasty=${encodeURIComponent(dynasty)}`)
  }, [navigate])

  const genreClick = useCallback((params) => {
    const genre = params.name
    if (genre) navigate(`/plays?genre=${encodeURIComponent(genre)}`)
  }, [navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <p className="text-vermillion-500 text-sm mb-2">◆</p>
        <p className="text-ink-500 text-sm mb-1">数据加载失败</p>
        <p className="text-ink-600 text-xs mb-3">{error}</p>
        <button onClick={loadData} className="text-xs text-gold-500/60 hover:text-gold-400 transition-colors">重新加载</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <p className="text-ink-500 animate-pulse text-sm tracking-wider">加载数据中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <p className="text-ink-500 text-sm">无数据</p>
      </div>
    )
  }

  const dynastyOption = {
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    grid: { left: 50, right: 16, top: 8, bottom: 28 },
    xAxis: {
      type: 'category',
      data: Object.entries(stats.dynastyCount).sort((a, b) => b[1] - a[1]).map(([k]) => k),
      axisLabel: { color: '#6B6B68', fontSize: 10 },
      axisLine: { lineStyle: { color: '#D5CEBC' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#E5DFD0' } },
      axisLabel: { color: '#6B6B68', fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: Object.entries(stats.dynastyCount).sort((a, b) => b[1] - a[1]).map(([, v]) => v),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#F59E0B' }, { offset: 1, color: '#DC2626' }] },
        borderRadius: [2, 2, 0, 0],
        cursor: 'pointer',
      },
      emphasis: { itemStyle: { opacity: 0.8 } },
    }],
  }

  const wordCloudOption = {
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { show: true, backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      keepAspect: false,
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      right: null,
      bottom: null,
      sizeRange: [14, 42],
      rotationRange: [-30, 30],
      rotationStep: 30,
      gridSize: 6,
      drawOutOfBound: false,
      layoutAnimation: true,
      textStyle: {
        fontFamily: 'Noto Serif SC, serif',
      },
      data: wordCloudData,
      emphasis: {
        textStyle: { color: '#FBBF24', fontSize: Math.max(wordCloudData[0]?.value || 36, 36) },
      },
    }],
  }

  const roleTypeOption = {
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { trigger: 'axis', backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    grid: { left: 56, right: 40, top: 8, bottom: 28 },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#E5DFD0' } },
      axisLabel: { color: '#6B6B68', fontSize: 9 },
    },
    yAxis: {
      type: 'category',
      data: stats.topRoleTypes.map(([n]) => n).reverse(),
      axisLabel: { color: '#4A4A48', fontSize: 10 },
      axisLine: { lineStyle: { color: '#D5CEBC' } },
    },
    series: [{
      type: 'bar',
      data: stats.topRoleTypes.map(([, v]) => v).reverse(),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#6366F1' }, { offset: 1, color: '#818CF8' }] },
        borderRadius: [0, 2, 2, 0],
      },
      label: { show: true, position: 'right', color: '#6B6B68', fontSize: 9 },
    }],
  }

  const genreOption = {
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    tooltip: { trigger: 'item', backgroundColor: '#FFFFFD', borderColor: '#D5CEBC', textStyle: { color: '#4A4A48', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['20%', '70%'],
      center: ['50%', '50%'],
      data: Object.entries(stats.genreCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })),
      label: { color: '#4A4A48', fontSize: 13, formatter: '{b}: {d}%' },
      labelLine: { length: 12, length2: 15, lineStyle: { color: '#3A3A3A' } },
      itemStyle: { borderRadius: 4, cursor: 'pointer' },
      emphasis: { itemStyle: { opacity: 0.8 } },
      color: ['#F59E0B', '#B91C1C', '#6366F1', '#14B8A6', '#DB2777', '#D97706', '#818CF8', '#8A8A88'],
    }],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="text-gold-600/50 text-sm font-title tracking-[0.5em] select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
          数据总览
        </div>
        <div className="page-title-wrap flex-1">
          <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
            <span className="text-vermillion-600 text-sm">◆</span>
            数据总览
          </h2>
          <p className="text-ink-500 text-xs mt-1 ml-4">京剧数据集整体规模一览</p>
        </div>
      </div>

      {/* stats cards - clickable */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="剧目总数" value={stats.totalPlays} sub="台本" delay={0} onClick={() => navigate('/plays')} />
        <StatCard label="角色总数" value={stats.totalRoles} sub="人物" delay={0.05} onClick={() => navigate('/roles')} />
        <StatCard label="角色关系" value={stats.totalRelations} sub="同现网络" delay={0.1} onClick={() => navigate('/roles?tab=network')} />
        <StatCard label="声腔类型" value={stats.totalMelodies} sub="西皮二黄等" delay={0.15} onClick={() => navigate('/melody')} />
        <StatCard label="行当种类" value={stats.uniqueRoleTypes} sub="脸谱色系" delay={0.2} onClick={() => navigate('/face-generator')} />
        <StatCard label="历史朝代" value={stats.uniqueDynasties} sub="时间跨度" delay={0.25} onClick={() => navigate('/heritage')} />
      </div>

      {/* data coverage */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-ink-500 text-xs">数据覆盖</span>
        {stats.coverage.map(c => (
          <span key={c.label}
            className={`text-xs px-2 py-0.5 rounded ${
              c.pct > 70 ? 'bg-ink-900/10 text-ink-700'
                : c.pct > 30 ? 'bg-gold-500/10 text-gold-600/80'
                : 'bg-paper-200/70 text-ink-500'
            }`}>
            {c.label} {c.pct}%<span className="ml-1 opacity-60">({c.count}/{stats.totalPlays})</span>
          </span>
        ))}
      </div>

      {/* charts */}
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-ink-600/60 mb-3">角色词云<span className="text-ink-500 ml-1">（字号越大表示出演剧目越多）</span></h3>
        <div className="w-full" style={{ aspectRatio: '21/9', minHeight: 260 }}>
          <ReactEChartsCore option={wordCloudOption} style={{ width: '100%', height: '100%' }} onEvents={{ click: wordCloudClick }} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="opera-card p-4">
          <h3 className="section-header text-xs text-ink-600/60 mb-3">行当子类 Top 10<span className="text-ink-500 ml-1">（角色数量排行）</span></h3>
          <div className="w-full" style={{ aspectRatio: '16/9', minHeight: 220 }}>
            <ReactEChartsCore option={roleTypeOption} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
        <div className="opera-card p-4">
          <h3 className="section-header text-xs text-ink-600/60 mb-3">题材分布（点击查看剧目）</h3>
          <div className="w-full" style={{ aspectRatio: '4/3', minHeight: 260 }}>
            <ReactEChartsCore option={genreOption} style={{ width: '100%', height: '100%' }} onEvents={{ click: genreClick }} />
          </div>
        </div>
      </div>
      <div className="opera-card p-4">
        <h3 className="section-header text-xs text-ink-600/60 mb-3">朝代分布（点击查看剧目）</h3>
        <div className="w-full" style={{ aspectRatio: '16/9', minHeight: 240 }}>
          <ReactEChartsCore option={dynastyOption} style={{ width: '100%', height: '100%' }} onEvents={{ click: dynastyClick }} />
        </div>
      </div>
    </div>
  )
}

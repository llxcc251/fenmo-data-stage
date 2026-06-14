import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from '../store/useStore'
import { DYNASTY_ORDER } from '../constants'

export default function PlayUniverse() {
  const { plays, roles, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    dynasty: searchParams.get('dynasty') || '',
    genre: searchParams.get('genre') || '',
    melody: searchParams.get('melody') || '',
  }))
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  // Sync filters + search to URL params
  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (filters.dynasty) params.dynasty = filters.dynasty
    if (filters.genre) params.genre = filters.genre
    if (filters.melody) params.melody = filters.melody
    setSearchParams(params, { replace: true })
  }, [search, filters, setSearchParams])

  const roleMap = useMemo(() => {
    const m = {}
    roles.forEach(r => { m[r.name] = r })
    return m
  }, [roles])

  // Available values for each dimension
  const dimValues = useMemo(() => {
    const dynastySet = new Set()
    const genreSet = new Set()
    const melodySet = new Set()
    plays.forEach(p => {
      if (p.dynasty) dynastySet.add(p.dynasty)
      ;(p.genres || []).forEach(g => genreSet.add(g))
      ;(p.melodies || []).forEach(m => melodySet.add(m))
    })
    return {
      dynasty: [...dynastySet].sort((a, b) => DYNASTY_ORDER.indexOf(a) - DYNASTY_ORDER.indexOf(b)),
      genre: [...genreSet].sort(),
      melody: [...melodySet].sort(),
    }
  }, [plays])

  // Filtered plays — combines search + all active dimension filters
  const filtered = useMemo(() => {
    let list = plays
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.altNames || []).some(a => a.toLowerCase().includes(q)) ||
        (p.dynasty || '').toLowerCase().includes(q) ||
        (p.genres || []).some(g => g.toLowerCase().includes(q)) ||
        (p.melodies || []).some(m => m.toLowerCase().includes(q)) ||
        Object.keys(p.roleTypes || {}).some(r => r.toLowerCase().includes(q))
      )
    }
    if (filters.dynasty) list = list.filter(p => p.dynasty === filters.dynasty)
    if (filters.genre) list = list.filter(p => (p.genres || []).includes(filters.genre))
    if (filters.melody) list = list.filter(p => (p.melodies || []).includes(filters.melody))
    return list
  }, [plays, search, filters])

  if (!loaded) return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      {error ? (
        <>
          <p className="text-vermillion-500 text-sm mb-2">◆</p>
          <p className="text-ink-500 text-sm mb-1">数据加载失败</p>
          <p className="text-ink-600 text-xs mb-3">{error}</p>
          <button onClick={loadData} className="text-xs text-gold-500/60 hover:text-gold-400 transition-colors">重新加载</button>
        </>
      ) : (
        <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="text-gold-600/50 text-sm font-title tracking-[0.5em] select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
          剧目之脉
        </div>
        <div className="page-title-wrap flex-1">
          <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
            <span className="text-vermillion-600 text-sm">◆</span>
            剧目之脉
          </h2>
          <p className="text-ink-500 text-xs mt-1 ml-4">探索 {plays.length} 部京剧剧目</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input type="text" placeholder="搜索剧目..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/60 border border-ink-600/30 rounded-lg px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-600/70 text-xs">✕</button>
        )}
        <p className="text-ink-600 text-xs mt-1.5">搜索剧目名、别名、朝代、题材、声腔、角色名</p>
      </div>

      {/* Multi-dimension filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filters.dynasty} onChange={e => setFilters(f => ({ ...f, dynasty: e.target.value }))}
          className="bg-white/60 border border-ink-600/30 rounded-lg px-3 py-1.5 text-xs text-ink-700 focus:outline-none focus:border-gold-500/50">
          <option value="">全部朝代</option>
          {dimValues.dynasty.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.genre} onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
          className="bg-white/60 border border-ink-600/30 rounded-lg px-3 py-1.5 text-xs text-ink-700 focus:outline-none focus:border-gold-500/50">
          <option value="">全部题材</option>
          {dimValues.genre.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filters.melody} onChange={e => setFilters(f => ({ ...f, melody: e.target.value }))}
          className="bg-white/60 border border-ink-600/30 rounded-lg px-3 py-1.5 text-xs text-ink-700 focus:outline-none focus:border-gold-500/50">
          <option value="">全部声腔</option>
          {dimValues.melody.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-ink-500 text-xs">{filtered.length} 部</span>
        {(search || filters.dynasty || filters.genre || filters.melody) && (
          <button onClick={() => { setSearch(''); setFilters({ dynasty: '', genre: '', melody: '' }); setShowAll(false) }}
            className="text-xs text-ink-500 hover:text-ink-600/70 transition-colors ml-auto">清除全部</button>
        )}
      </div>

      {/* Results — flat grid with pagination */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-ink-500 text-sm mb-1">没有找到匹配的剧目</p>
          <p className="text-ink-600 text-xs">试试其他关键词或筛选条件</p>
          {(search || filters.dynasty || filters.genre || filters.melody) && (
            <button onClick={() => { setSearch(''); setFilters({ dynasty: '', genre: '', melody: '' }) }}
              className="text-xs text-gold-500/60 hover:text-gold-400 mt-3 transition-colors">
              清除所有筛选
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.slice(0, showAll ? filtered.length : 24).map(p => (
              <PlayCard key={p.id} play={p} roleMap={roleMap} navigate={navigate} setFilters={setFilters} />
            ))}
          </div>
          {filtered.length > 24 && !showAll && (
            <button onClick={() => setShowAll(true)}
              className="w-full text-center py-3 mt-3 text-xs text-gold-400/60 hover:text-gold-400 border border-dashed border-ink-700/30 rounded-lg transition-colors">
              显示全部 {filtered.length} 部
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PlayCard({ play: p, roleMap, navigate, setFilters }) {
  const filterBy = (dim, value) => { setFilters(f => ({ ...f, [dim]: value })) }
  return (
    <div className="opera-card p-4 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-title text-ink-900 text-sm group-hover:text-gold-400 transition-colors">{p.title}</h3>
        {p.dynasty && (
          <button onClick={() => filterBy('dynasty', p.dynasty)}
            className="text-xs text-gold-400/60 px-2 py-0.5 bg-gold-500/5 rounded hover:bg-gold-500/15 hover:text-gold-400 transition-colors">
            {p.dynasty}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {(p.genres || []).slice(0, 3).map(g => (
          <button key={g} onClick={() => filterBy('genre', g)}
            className="text-xs text-ink-500 px-1.5 py-0.5 bg-paper-200/70 rounded hover:bg-paper-200/80 hover:text-ink-600/70 transition-colors">
            {g}
          </button>
        ))}
      </div>
      <p className="text-ink-600 text-xs mt-2 leading-relaxed line-clamp-2">
        {p.plot?.slice(0, 120) || '暂无剧情摘要'}
      </p>
      <div className="mt-3 text-xs text-ink-500 border-t border-ink-700/30 pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span>{Object.entries(p.roleTypes || {}).filter(([n]) => !roleMap[n]?.generic).length} 角色：</span>
          <span className="flex flex-wrap gap-1">
            {Object.entries(p.roleTypes || {}).filter(([name]) => !roleMap[name]?.generic).slice(0, 5).map(([name, type]) => (
              <button key={name}
                onClick={() => navigate(`/face-generator?role=${encodeURIComponent(name)}`)}
                className="hover:text-gold-400 transition-colors">
                {name}
              </button>
            ))}
            {Object.entries(p.roleTypes || {}).filter(([n]) => !roleMap[n]?.generic).length > 5 && <span>等 {Object.entries(p.roleTypes || {}).filter(([n]) => !roleMap[n]?.generic).length} 位</span>}
          </span>
        </div>
        {(p.melodies || []).length > 0 && (
          <div className="flex flex-wrap gap-1">{p.melodies.map(m => (
            <button key={m} onClick={() => filterBy('melody', m)}
              className="text-xs text-ink-500 hover:text-ink-600/70 transition-colors">{m}</button>
          ))}</div>
        )}
      </div>
      {p.id && (
        <a href={`/api/play-pdf/${p.id}`} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-vermillion-600/60 hover:text-vermillion-500 transition-colors">
          ◈ 查看原始剧本
        </a>
      )}
    </div>
  )
}

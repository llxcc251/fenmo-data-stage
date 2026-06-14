import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from '../store/useStore'
import { DYNASTY_ORDER } from '../constants'

const DIMS = [
  { key: 'dynasty', label: '朝代' },
  { key: 'genre', label: '题材' },
  { key: 'melody', label: '声腔' },
]

export default function PlayUniverse() {
  const { plays, roles, loaded, error, loadData } = useStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize from URL params
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [dim, setDim] = useState(() => {
    if (searchParams.get('dynasty')) return 'dynasty'
    if (searchParams.get('genre')) return 'genre'
    if (searchParams.get('melody')) return 'melody'
    return 'dynasty'
  })
  const [value, setValue] = useState(() => {
    return searchParams.get('dynasty') || searchParams.get('genre') || searchParams.get('melody') || ''
  })
  const [showAllGroups, setShowAllGroups] = useState(false)

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  // Sync state to URL params
  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (value) params[dim] = value
    setSearchParams(params, { replace: true })
  }, [search, dim, value, setSearchParams])

  const roleMap = useMemo(() => {
    const m = {}
    roles.forEach(r => { m[r.name] = r })
    return m
  }, [roles])

  // Available values for the selected dimension
  const values = useMemo(() => {
    const s = new Set()
    if (dim === 'dynasty') {
      plays.forEach(p => { if (p.dynasty) s.add(p.dynasty) })
      return [...s].sort((a, b) => DYNASTY_ORDER.indexOf(a) - DYNASTY_ORDER.indexOf(b))
    }
    if (dim === 'genre') {
      plays.forEach(p => (p.genres || []).forEach(g => s.add(g)))
      return [...s].sort()
    }
    if (dim === 'melody') {
      plays.forEach(p => (p.melodies || []).forEach(m => s.add(m)))
      return [...s].sort()
    }
    return []
  }, [plays, dim])

  // Filtered plays
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
        // plot excluded — too many false positives
      )
    }
    if (value) {
      if (dim === 'dynasty') list = list.filter(p => p.dynasty === value)
      else if (dim === 'genre') list = list.filter(p => (p.genres || []).includes(value))
      else if (dim === 'melody') list = list.filter(p => (p.melodies || []).includes(value))
    }
    return list
  }, [plays, search, dim, value])

  if (!loaded) return (
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

  return (
    <div className="space-y-6">
      <div className="page-title-wrap">
        <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          剧目之脉
        </h2>
        <p className="text-ink-500 text-xs mt-1 ml-4">探索 {plays.length} 部京剧剧目</p>
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
        <p className="text-ink-600 text-[10px] mt-1.5">搜索剧目名、别名、朝代、题材、声腔、角色名</p>
      </div>

      {/* Dimension selector */}
      <div className="flex items-center gap-2">
        <span className="text-ink-600/60 text-xs">按</span>
        <div className="flex gap-1">
          {DIMS.map(d => (
            <button key={d.key} onClick={() => { setDim(d.key); setValue(''); setShowAllGroups(false) }}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                dim === d.key
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-ink-600/50 border border-transparent hover:text-ink-600/70 hover:bg-paper-200/70'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
        <select value={value} onChange={e => setValue(e.target.value)}
          className="bg-white/60 border border-ink-600/30 rounded-lg px-3 py-1.5 text-sm text-ink-700 focus:outline-none focus:border-gold-500/50">
          <option value="">全部{dim === 'dynasty' ? '朝代' : dim === 'genre' ? '题材' : '声腔'}</option>
          {values.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-ink-500 text-[10px]">{filtered.length} 部</span>
        {(search || value) && (
          <button onClick={() => { setSearch(''); setValue(''); setShowAllGroups(false) }}
            className="text-[10px] text-ink-500 hover:text-ink-600/70 transition-colors ml-auto">清除</button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-ink-500 text-sm mb-1">没有找到匹配的剧目</p>
          <p className="text-ink-600 text-[10px]">试试其他关键词或筛选条件</p>
          {(search || value) && (
            <button onClick={() => { setSearch(''); setValue('') }}
              className="text-[10px] text-gold-500/60 hover:text-gold-400 mt-3 transition-colors">
              清除所有筛选
            </button>
          )}
        </div>
      ) : !value ? (
        /* No specific value selected: show categories as sections */
        <div className="space-y-8">
          {values.filter(v => {
            // When search is active, only show groups that have matching plays
            if (!search) return true
            if (dim === 'dynasty') return filtered.some(p => p.dynasty === v)
            if (dim === 'genre') return filtered.some(p => (p.genres || []).includes(v))
            return filtered.some(p => (p.melodies || []).includes(v))
          }).slice(0, showAllGroups || search ? values.length : 15).map(v => {
            let items
            if (dim === 'dynasty') items = filtered.filter(p => p.dynasty === v)
            else if (dim === 'genre') items = filtered.filter(p => (p.genres || []).includes(v))
            else items = filtered.filter(p => (p.melodies || []).includes(v))
            if (!items.length) return null
            return (
              <div key={v}>
                <button onClick={() => setValue(v)}
                  className="section-header text-xs text-ink-600/60 mb-3 hover:text-gold-400 transition-colors">
                  <span>{v}<span className="text-ink-500 ml-1">({items.length})</span></span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.slice(0, 6).map(p => (
                    <PlayCard key={p.id} play={p} roleMap={roleMap} navigate={navigate} setDim={setDim} setValue={setValue} />
                  ))}
                </div>
                {items.length > 6 && (
                  <button onClick={() => setValue(v)}
                    className="text-[10px] text-gold-400/60 hover:text-gold-400 mt-2 transition-colors">
                    查看全部 {items.length} 部 →
                  </button>
                )}
              </div>
            )
          })}
          {!showAllGroups && !search && values.length > 15 && (
            <button onClick={() => setShowAllGroups(true)}
              className="w-full text-center py-3 text-[10px] text-gold-400/60 hover:text-gold-400 border border-dashed border-ink-700/30 rounded-lg transition-colors">
              展开全部 {values.length} 组
            </button>
          )}
        </div>
      ) : (
        /* Specific value selected: show plays grid */
        <div>
          <p className="section-header text-xs text-ink-600/60 mb-3">{value} ({filtered.length} 部)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => (
              <PlayCard key={p.id} play={p} roleMap={roleMap} navigate={navigate} setDim={setDim} setValue={setValue} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayCard({ play: p, roleMap, navigate, setDim, setValue }) {
  const filterBy = (dim, value) => { setDim(dim); setValue(value) }
  return (
    <div className="opera-card p-4 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-title text-ink-900 text-sm group-hover:text-gold-400 transition-colors">{p.title}</h3>
        {p.dynasty && (
          <button onClick={() => filterBy('dynasty', p.dynasty)}
            className="text-[10px] text-gold-400/60 px-2 py-0.5 bg-gold-500/5 rounded hover:bg-gold-500/15 hover:text-gold-400 transition-colors">
            {p.dynasty}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {(p.genres || []).slice(0, 3).map(g => (
          <button key={g} onClick={() => filterBy('genre', g)}
            className="text-[10px] text-ink-500 px-1.5 py-0.5 bg-paper-200/70 rounded hover:bg-paper-200/80 hover:text-ink-600/70 transition-colors">
            {g}
          </button>
        ))}
      </div>
      <p className="text-ink-500 text-[10px] mt-2 line-clamp-2 leading-relaxed">
        {p.plot?.slice(0, 120) || '暂无剧情摘要'}
      </p>
      <div className="mt-3 text-[10px] text-ink-500 border-t border-ink-700/30 pt-2 space-y-1">
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
              className="text-[10px] text-ink-500 hover:text-ink-600/70 transition-colors">{m}</button>
          ))}</div>
        )}
      </div>
      {p.id && (
        <a href={`/api/play-pdf/${p.id}`} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-vermillion-600/60 hover:text-vermillion-500 transition-colors">
          ◈ 查看原始剧本
        </a>
      )}
    </div>
  )
}

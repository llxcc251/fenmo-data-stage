import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const DYNASTY_ORDER = ['商','周','春秋','战国','秦','汉','三国','晋','南北朝','隋','唐','五代','宋','北宋','南宋','元','明','清','民间故事']

const DIMS = [
  { key: 'dynasty', label: '朝代' },
  { key: 'genre', label: '题材' },
  { key: 'melody', label: '声腔' },
]

export default function PlayUniverse() {
  const { plays, roles, loaded, loadData } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dim, setDim] = useState('dynasty')
  const [value, setValue] = useState('')

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

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
        Object.keys(p.roleTypes || {}).some(r => r.toLowerCase().includes(q)) ||
        (p.plot || '').toLowerCase().includes(q)
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
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
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
          className="w-full bg-ink-800/60 border border-ink-600/30 rounded-lg px-3 py-2 text-sm text-jade-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50 transition-colors" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 hover:text-jade-200/60 text-xs">✕</button>
        )}
      </div>

      {/* Dimension selector */}
      <div className="flex items-center gap-2">
        <span className="text-jade-200/50 text-xs">按</span>
        <div className="flex gap-1">
          {DIMS.map(d => (
            <button key={d.key} onClick={() => { setDim(d.key); setValue('') }}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                dim === d.key
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-jade-200/40 border border-transparent hover:text-jade-200/60 hover:bg-ink-700/30'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
        <select value={value} onChange={e => setValue(e.target.value)}
          className="bg-ink-800/60 border border-ink-600/30 rounded-lg px-3 py-1.5 text-sm text-jade-200 focus:outline-none focus:border-gold-500/50">
          <option value="">全部{dim === 'dynasty' ? '朝代' : dim === 'genre' ? '题材' : '声腔'}</option>
          {values.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span className="text-ink-500 text-[10px]">{filtered.length} 部</span>
        {(search || value) && (
          <button onClick={() => { setSearch(''); setValue('') }}
            className="text-[10px] text-ink-500 hover:text-jade-200/60 transition-colors ml-auto">清除</button>
        )}
      </div>

      {/* Results */}
      {!value ? (
        /* No specific value selected: show categories as sections */
        <div className="space-y-8">
          {values.slice(0, 15).map(v => {
            let items
            if (dim === 'dynasty') items = filtered.filter(p => p.dynasty === v)
            else if (dim === 'genre') items = filtered.filter(p => (p.genres || []).includes(v))
            else items = filtered.filter(p => (p.melodies || []).includes(v))
            if (!items.length) return null
            return (
              <div key={v}>
                <button onClick={() => setValue(v)}
                  className="section-header text-xs text-jade-200/50 mb-3 hover:text-gold-400 transition-colors">
                  <span>{v}<span className="text-ink-500 ml-1">({items.length})</span></span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.slice(0, 6).map(p => (
                    <PlayCard key={p.id} play={p} roleMap={roleMap} navigate={navigate} />
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
        </div>
      ) : (
        /* Specific value selected: show plays grid */
        <div>
          <p className="section-header text-xs text-jade-200/50 mb-3">{value} ({filtered.length} 部)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => (
              <PlayCard key={p.id} play={p} roleMap={roleMap} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayCard({ play: p, roleMap, navigate }) {
  return (
    <div className="opera-card p-4 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-title text-jade-100 text-sm group-hover:text-gold-400 transition-colors">{p.title}</h3>
        {p.dynasty && (
          <span className="text-[10px] text-gold-400/60 px-2 py-0.5 bg-gold-500/5 rounded">{p.dynasty}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {(p.genres || []).slice(0, 3).map(g => (
          <span key={g} className="text-[10px] text-ink-500 px-1.5 py-0.5 bg-ink-700/30 rounded">{g}</span>
        ))}
      </div>
      <p className="text-ink-500 text-[10px] mt-2 line-clamp-2 leading-relaxed">
        {p.plot?.slice(0, 120) || '暂无剧情摘要'}
      </p>
      <div className="mt-3 text-[10px] text-ink-500 border-t border-ink-700/30 pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span>{Object.keys(p.roleTypes || {}).length} 角色：</span>
          <span className="flex flex-wrap gap-1">
            {Object.entries(p.roleTypes || {}).slice(0, 5).map(([name, type]) => (
              <button key={name}
                onClick={() => navigate(`/face-generator?role=${encodeURIComponent(name)}`)}
                className="hover:text-gold-400 transition-colors">
                {name}
              </button>
            ))}
            {Object.keys(p.roleTypes || {}).length > 5 && <span>等 {Object.keys(p.roleTypes || {}).length} 位</span>}
          </span>
        </div>
        {(p.melodies || []).length > 0 && (
          <div className="flex items-center gap-1">{p.melodies.map(m => <span key={m} className="text-ink-500">{m}</span>)}</div>
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

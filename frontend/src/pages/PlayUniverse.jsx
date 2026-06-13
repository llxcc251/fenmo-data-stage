import { useEffect, useMemo, useState } from 'react'
import useStore from '../store/useStore'

export default function PlayUniverse() {
  const { plays, loaded, loadData } = useStore()
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const genres = useMemo(() => {
    const g = new Set()
    plays.forEach(p => (p.genres || []).forEach(x => g.add(x)))
    return ['', ...g].sort()
  }, [plays])

  const filtered = useMemo(() => {
    let list = plays
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.altNames || []).some(a => a.toLowerCase().includes(q)))
    }
    if (genreFilter) {
      list = list.filter(p => (p.genres || []).includes(genreFilter))
    }
    return list.slice(0, 100)
  }, [plays, search, genreFilter])

  if (!loaded) return <div className="text-ink-500 p-8">加载中...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl text-gold-500">剧目之脉</h2>
        <p className="text-ink-500 text-xs mt-1">探索 {plays.length} 部京剧剧目</p>
      </div>

      {/* filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="搜索剧目..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-ink-800/60 border border-ink-600/30 rounded-lg px-4 py-2 text-sm text-jade-100
                     placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
        />
        <select
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
          className="bg-ink-800/60 border border-ink-600/30 rounded-lg px-4 py-2 text-sm text-jade-200
                     focus:outline-none focus:border-gold-500/50"
        >
          <option value="">全部分类</option>
          {genres.filter(Boolean).map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* play list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => (
          <div key={p.id} className="bg-ink-800/40 border border-ink-600/20 rounded-lg p-4 hover:border-gold-500/20 transition-colors">
            <div className="flex items-start justify-between">
              <h3 className="font-title text-jade-100 text-sm">{p.title}</h3>
              {p.dynasty && (
                <span className="text-[10px] text-gold-400/60 px-2 py-0.5 bg-gold-500/5 rounded">{p.dynasty}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(p.genres || []).slice(0, 2).map(g => (
                <span key={g} className="text-[10px] text-ink-500">{g}</span>
              ))}
            </div>
            <p className="text-ink-500 text-[10px] mt-2 line-clamp-2">{p.plot?.slice(0, 120)}</p>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-ink-500">
              <span>{Object.keys(p.roleTypes || {}).length} 角色</span>
              <span>{(p.melodies || []).join(' · ')}</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-ink-500 text-sm text-center py-8">未找到匹配剧目</p>}
    </div>
  )
}

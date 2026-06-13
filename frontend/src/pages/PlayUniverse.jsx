import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function PlayUniverse() {
  const { plays, roles, loaded, loadData } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const search = searchParams.get('search') || ''
  const genreFilter = searchParams.get('genre') || ''
  const dynastyFilter = searchParams.get('dynasty') || ''
  const melodyFilter = searchParams.get('melody') || ''

  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const genres = useMemo(() => {
    const g = new Set()
    plays.forEach(p => (p.genres || []).forEach(x => g.add(x)))
    return ['', ...g].sort()
  }, [plays])

  const dynasties = useMemo(() => {
    const d = new Set()
    plays.forEach(p => { if (p.dynasty) d.add(p.dynasty) })
    return ['', ...d].sort((a, b) => {
      const order = ['商','周','春秋','战国','秦','汉','三国','晋','南北朝','隋','唐','五代','宋','元','明','清']
      return order.indexOf(a) - order.indexOf(b)
    })
  }, [plays])

  const melodies = useMemo(() => {
    const m = new Set()
    plays.forEach(p => (p.melodies || []).forEach(x => m.add(x)))
    return ['', ...m].sort()
  }, [plays])

  const filtered = useMemo(() => {
    let list = plays
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.altNames || []).some(a => a.toLowerCase().includes(q)))
    }
    if (genreFilter) list = list.filter(p => (p.genres || []).includes(genreFilter))
    if (dynastyFilter) list = list.filter(p => p.dynasty === dynastyFilter)
    if (melodyFilter) list = list.filter(p => (p.melodies || []).includes(melodyFilter))
    return list.slice(0, 100)
  }, [plays, search, genreFilter, dynastyFilter, melodyFilter])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const roleMap = useMemo(() => {
    const m = {}
    roles.forEach(r => { m[r.name] = r })
    return m
  }, [roles])

  if (!loaded) return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
      <p className="text-ink-500 animate-pulse text-sm">加载中...</p>
    </div>
  )

  const hasFilters = search || genreFilter || dynastyFilter || melodyFilter

  return (
    <div className="space-y-6">
      <div className="page-title-wrap">
        <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
          <span className="text-vermillion-600 text-sm">◆</span>
          剧目之脉
        </h2>
        <p className="text-ink-500 text-xs mt-1 ml-4">探索 {plays.length} 部京剧剧目</p>
      </div>

      {/* filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="搜索剧目..."
              value={search}
              onChange={e => updateFilter('search', e.target.value)}
              className="w-full bg-ink-800/60 border border-ink-600/30 rounded-lg px-4 py-2.5 text-sm text-jade-100
                         placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-jade-200/60 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={genreFilter}
            onChange={e => updateFilter('genre', e.target.value)}
            className="bg-ink-800/60 border border-ink-600/30 rounded-lg px-3 py-2.5 text-sm text-jade-200
                       focus:outline-none focus:border-gold-500/50 transition-colors"
          >
            <option value="">全部分类</option>
            {genres.filter(Boolean).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={dynastyFilter}
            onChange={e => updateFilter('dynasty', e.target.value)}
            className="bg-ink-800/60 border border-ink-600/30 rounded-lg px-3 py-2.5 text-sm text-jade-200
                       focus:outline-none focus:border-gold-500/50 transition-colors"
          >
            <option value="">全部朝代</option>
            {dynasties.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-ink-500 text-[10px]">
              筛选：{search && `"${search}" `}{genreFilter}{dynastyFilter}{melodyFilter}
            </span>
            <button onClick={clearFilters} className="text-[10px] text-jade-200/40 hover:text-jade-200/60 transition-colors">
              清除全部
            </button>
          </div>
        )}
      </div>

      {/* play cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => (
          <div key={p.id} className="opera-card p-4 group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-title text-jade-100 text-sm group-hover:text-gold-400 transition-colors duration-300">
                {p.title}
              </h3>
              {p.dynasty && (
                <button
                  onClick={() => navigate(`/plays?dynasty=${encodeURIComponent(p.dynasty)}`)}
                  className="text-[10px] text-gold-400/60 px-2 py-0.5 bg-gold-500/5 rounded hover:bg-gold-500/10 hover:text-gold-400 transition-colors"
                  title={`查看${p.dynasty}代剧目`}
                >
                  {p.dynasty}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {(p.genres || []).slice(0, 3).map(g => (
                <button
                  key={g}
                  onClick={() => navigate(`/plays?genre=${encodeURIComponent(g)}`)}
                  className="text-[10px] text-ink-500 px-1.5 py-0.5 bg-ink-700/30 rounded hover:bg-ink-700/50 hover:text-jade-200/60 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-ink-500 text-[10px] mt-2 line-clamp-2 leading-relaxed">
              {p.plot?.slice(0, 120) || '暂无剧情摘要'}
            </p>
            <div className="mt-3 text-[10px] text-ink-500 border-t border-ink-700/30 pt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span>{Object.keys(p.roleTypes || {}).length} 角色：</span>
                <span className="flex flex-wrap gap-1">
                  {Object.entries(p.roleTypes || {}).slice(0, 5).map(([name, type]) => {
                    const role = roleMap[name]
                    return (
                      <button
                        key={name}
                        onClick={() => navigate(`/face-generator?role=${encodeURIComponent(name)}`)}
                        className="hover:text-gold-400 transition-colors"
                        title={`查看${name}的脸谱`}
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-sm mr-0.5 align-middle"
                          style={{
                            backgroundColor: role?.faceColor
                              ? ({ '红':'#DC2626','黑':'#171717','白':'#F5F5F0','蓝':'#2563EB','黄':'#D97706','紫':'#7C3AED','金':'#F59E0B','绿':'#16A34A','粉':'#F9A8D4','灰':'#6B7280','青':'#14B8A6','赭':'#92400E' }[role.faceColor] || '#6B7280')
                              : '#6B7280'
                          }}
                        />
                        {name}
                      </button>
                    )
                  })}
                  {Object.keys(p.roleTypes || {}).length > 5 && <span>等 {Object.keys(p.roleTypes || {}).length} 位</span>}
                </span>
              </div>
              {(p.melodies || []).length > 0 && (
                <div className="flex items-center gap-1">
                  {(p.melodies || []).map(m => (
                    <button
                      key={m}
                      onClick={() => navigate(`/plays?melody=${encodeURIComponent(m)}`)}
                      className="hover:text-gold-400 transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {p.id && (
              <a
                href={`/api/play-pdf/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[10px] text-vermillion-600/60 hover:text-vermillion-500 transition-colors"
              >
                ◈ 查看原始剧本
              </a>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="opera-card p-8 text-center">
          <p className="text-ink-500 text-sm">未找到匹配剧目</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-gold-400 text-xs mt-2 hover:text-gold-300 transition-colors">
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  )
}

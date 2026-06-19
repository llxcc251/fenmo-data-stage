import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'

const FACE_COLORS = {
  '红': { fill: '#DC2626', label: '忠勇' },
  '黑': { fill: '#171717', label: '刚直' },
  '白': { fill: '#F5F5F0', label: '奸诈' },
  '蓝': { fill: '#2563EB', label: '刚强' },
  '黄': { fill: '#D97706', label: '勇猛' },
  '紫': { fill: '#7C3AED', label: '稳重' },
  '金': { fill: '#F59E0B', label: '神佛' },
  '绿': { fill: '#16A34A', label: '暴躁' },
  '粉': { fill: '#F9A8D4', label: '年迈' },
  '灰': { fill: '#6B7280', label: '鬼怪' },
  '青': { fill: '#14B8A6', label: '骁勇' },
  '赭': { fill: '#92400E', label: '老练' },
}

const FALLBACK_COLORS = {
  '老生': '#92400E', '小生': '#60A5FA', '武生': '#14B8A6', '红生': '#DC2626',
  '正生': '#1E40AF', '武老生': '#6B7280', '娃娃生': '#A78BFA', '外': '#92400E',
  '末': '#6B7280', '童': '#A78BFA', '生': '#6366F1',
  '正旦': '#DB2777', '花旦': '#EC4899', '老旦': '#92400E', '武旦': '#2563EB',
  '小旦': '#F9A8D4', '彩旦': '#D97706', '贴旦': '#BE185D', '丑旦': '#65A30D',
  '旦': '#EC4899',
  '净': '#171717', '二净': '#1E3A8A', '副净': '#7C3AED', '武净': '#2563EB',
  '花净': '#DC2626', '老净': '#6B7280',
  '丑': '#6B7280', '小丑': '#65A30D', '老丑': '#92400E', '武丑': '#16A34A',
  '付': '#65A30D',
}

function getRoleColor(role) {
  if (!role) return '#6B7280'
  if (role.faceColor && FACE_COLORS[role.faceColor]) return FACE_COLORS[role.faceColor].fill
  const fallback = FALLBACK_COLORS[role.type]
  if (fallback) return fallback
  const catFallback = { '生': '#14B8A6', '旦': '#DB2777', '净': '#2563EB', '丑': '#A3A3A3' }
  return catFallback[role.category] || '#6B7280'
}

function getColorLabel(role) {
  if (!role) return '未知'
  if (role.faceColor && FACE_COLORS[role.faceColor]) return `${role.faceColor} — ${FACE_COLORS[role.faceColor].label}`
  const color = getRoleColor(role)
  const match = Object.entries(FACE_COLORS).find(([, v]) => v.fill === color)
  if (match) return `${match[0]} — ${match[1].label}（行当映射）`
  return null
}

function lighten(hex, amt) {
  const h = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (h >> 16) + amt)
  const g = Math.min(255, ((h >> 8) & 0xFF) + amt)
  const b = Math.min(255, (h & 0xFF) + amt)
  return `rgb(${r},${g},${b})`
}

function darken(hex, amt) {
  const h = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (h >> 16) - amt)
  const g = Math.max(0, ((h >> 8) & 0xFF) - amt)
  const b = Math.max(0, (h & 0xFF) - amt)
  return `rgb(${r},${g},${b})`
}

// ---- SVG Face Component ---- //
function OperaFace({ category, color }) {
  const c = color || '#6B7280'
  const isSheng = category === '生'
  const isDan = category === '旦'
  const isJing = category === '净'
  const isChou = category === '丑'
  const isDark = /^(#171717|#1E3A8A|#1E40AF|#0A0A0A)/.test(c)
  const light = lighten(c, 60)
  const dark = darken(c, 40)
  const accent = isDan ? '#EC4899' : isSheng ? '#14B8A6' : isJing ? '#F59E0B' : '#6B7280'

  return (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
      <defs>
        {/* Face glow */}
        <radialGradient id={`faceGlow-${category}`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={light} stopOpacity="0.3" />
          <stop offset="70%" stopColor={c} stopOpacity="0.9" />
          <stop offset="100%" stopColor={dark} stopOpacity="1" />
        </radialGradient>
        {/* Pattern fills for 净 */}
        <pattern id={`swirl-${category}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M6 0 Q12 6 6 12 Q0 6 6 0" fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* === HAIR / HEADPIECE === */}
      {/* Hair base */}
      <path d="M15 10 Q50 0 85 10 Q88 25 85 35 Q50 28 15 35 Q12 25 15 10Z"
        fill="#0A0A0A" opacity={isDan ? 0.9 : 0.85} />

      {isDan && (
        <>
          {/* 旦 — Hair ornaments */}
          <circle cx="30" cy="15" r="3" fill="#F59E0B" opacity="0.8" />
          <circle cx="70" cy="15" r="3" fill="#F59E0B" opacity="0.8" />
          <circle cx="30" cy="15" r="5" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.4" />
          <circle cx="70" cy="15" r="5" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.4" />
          {/* Hairpin */}
          <line x1="50" y1="6" x2="50" y2="16" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
          <circle cx="50" cy="5" r="2.5" fill="#DC2626" opacity="0.5" />
          {/* Forehead ornament */}
          <circle cx="50" cy="22" r="2" fill="#DC2626" opacity="0.3" />
        </>
      )}

      {isJing && (
        <>
          {/* 净 — Hero headpiece crest */}
          <path d="M38 6 Q50 0 62 6" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.6" />
          <circle cx="50" cy="4" r="3" fill={accent} opacity="0.5" />
          {/* Ear tufts */}
          <path d="M12 25 Q6 20 8 28" fill="none" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
          <path d="M88 25 Q94 20 92 28" fill="none" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />
        </>
      )}

      {isChou && (
        <>
          {/* 丑 — Small hat ball */}
          <circle cx="50" cy="8" r="4" fill="#65A30D" opacity="0.5" />
          <circle cx="50" cy="8" r="2" fill="#65A30D" opacity="0.3" />
        </>
      )}

      {/* === FACE OUTLINE === */}
      <path
        d={
          isDan
            ? "M25 25 Q20 30 18 45 Q16 60 22 75 Q28 88 50 95 Q72 88 78 75 Q84 60 82 45 Q80 30 75 25Z"
            : isChou
              ? "M22 22 Q18 30 16 48 Q14 65 22 80 Q30 92 50 97 Q70 92 78 80 Q86 65 84 48 Q82 30 78 22Z"
              : "M20 20 Q15 28 14 48 Q13 68 22 82 Q32 95 50 100 Q68 95 78 82 Q87 68 86 48 Q85 28 80 20Z"
        }
        fill={isJing ? `url(#faceGlow-${category})` : c}
        stroke={dark}
        strokeWidth={isJing ? 1.5 : 1}
      />

      {/* === EAR === */}
      <ellipse cx="16" cy="50" rx="3" ry="6" fill={light} stroke={dark} strokeWidth="0.5" opacity="0.7" />
      <ellipse cx="84" cy="50" rx="3" ry="6" fill={light} stroke={dark} strokeWidth="0.5" opacity="0.7" />

      {!isDan && (
        <>
          <path d="M12 48 Q10 50 12 52" fill="none" stroke={dark} strokeWidth="0.5" opacity="0.4" />
          <path d="M88 48 Q90 50 88 52" fill="none" stroke={dark} strokeWidth="0.5" opacity="0.4" />
        </>
      )}

      {/* === NOSE === */}
      {isDan ? (
        <>
          <ellipse cx="50" cy="55" rx="2" ry="3" fill={darken(c, 20)} opacity="0.5" />
          <path d="M50 52 Q52 58 50 60" fill="none" stroke={dark} strokeWidth="0.6" opacity="0.4" />
        </>
      ) : (
        <>
          <ellipse cx="50" cy="56" rx="3" ry="4" fill={darken(c, 30)} opacity="0.6" />
          <path d="M50 52 Q53 58 50 62" fill="none" stroke={dark} strokeWidth="0.8" opacity="0.5" />
          <ellipse cx="47" cy="58" rx="1.5" ry="1" fill={darken(c, 40)} opacity="0.3" />
          <ellipse cx="53" cy="58" rx="1.5" ry="1" fill={darken(c, 40)} opacity="0.3" />
        </>
      )}

      {/* === EYES === */}
      {/* Eye sockets */}
      {isDan ? (
        <>
          <ellipse cx="32" cy="42" rx="8" ry="5" fill={`rgba(0,0,0,0.15)`} />
          <ellipse cx="68" cy="42" rx="8" ry="5" fill={`rgba(0,0,0,0.15)`} />
          <ellipse cx="32" cy="42" rx="6" ry="3.5" fill="#0A0A0A" />
          <ellipse cx="68" cy="42" rx="6" ry="3.5" fill="#0A0A0A" />
          <ellipse cx="33" cy="41.5" rx="2.5" ry="2" fill="#FFF" opacity="0.7" />
          <ellipse cx="69" cy="41.5" rx="2.5" ry="2" fill="#FFF" opacity="0.7" />
        </>
      ) : (
        <>
          <ellipse cx="32" cy="42" rx="9" ry="6" fill={`rgba(0,0,0,0.2)`} />
          <ellipse cx="68" cy="42" rx="9" ry="6" fill={`rgba(0,0,0,0.2)`} />
          {/* Eyeballs */}
          <ellipse cx="32" cy="42" rx="7" ry="4" fill="#0A0A0A" />
          <ellipse cx="68" cy="42" rx="7" ry="4" fill="#0A0A0A" />
          {/* Iris */}
          <ellipse cx="33" cy="41" rx="2.5" ry="2.5" fill="#FFF" opacity="0.8" />
          <ellipse cx="69" cy="41" rx="2.5" ry="2.5" fill="#FFF" opacity="0.8" />
          {/* Pupil */}
          <circle cx="34" cy="41" r="1" fill="#FFF" opacity="0.5" />
          <circle cx="70" cy="41" r="1" fill="#FFF" opacity="0.5" />
        </>
      )}

      {/* === EYEBROWS === */}
      {isDan ? (
        <>
          <path d="M22 34 Q32 30 42 34" fill="none" stroke="#0A0A0A" strokeWidth="1" opacity="0.6" />
          <path d="M58 34 Q68 30 78 34" fill="none" stroke="#0A0A0A" strokeWidth="1" opacity="0.6" />
        </>
      ) : isChou ? (
        <>
          {/* 丑 — Comical ragged eyebrows */}
          <path d="M20 34 Q25 32 30 35 Q35 32 40 34" fill="none" stroke="#0A0A0A" strokeWidth="2" opacity="0.7" />
          <path d="M60 34 Q65 32 70 35 Q75 32 80 34" fill="none" stroke="#0A0A0A" strokeWidth="2" opacity="0.7" />
          {/* Bushy brow hairs */}
          <line x1="23" y1="33" x2="25" y2="31" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
          <line x1="30" y1="33" x2="32" y2="30" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
          <line x1="63" y1="33" x2="65" y2="31" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
          <line x1="70" y1="33" x2="72" y2="30" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.4" />
        </>
      ) : isJing ? (
        <>
          {/* 净 — Bold, slanted brows */}
          <path d="M18 36 Q25 32 40 34" fill="none" stroke="#0A0A0A" strokeWidth="2.5" opacity="0.9" />
          <path d="M60 34 Q75 32 82 36" fill="none" stroke="#0A0A0A" strokeWidth="2.5" opacity="0.9" />
        </>
      ) : (
        <>
          {/* 生 — Elegant arched brows */}
          <path d="M20 35 Q30 30 42 34" fill="none" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.7" />
          <path d="M58 34 Q70 30 80 35" fill="none" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.7" />
        </>
      )}

      {/* === MOUTH === */}
      {isDan ? (
        <>
          {/* 旦 — Small red mouth */}
          <path d="M40 72 Q50 76 60 72 Q55 80 45 80Z" fill="#DC2626" opacity="0.7" />
          <path d="M42 73 Q50 75 58 73" fill="none" stroke="#0A0A0A" strokeWidth="0.3" opacity="0.3" />
        </>
      ) : isChou ? (
        <>
          {/* 丑 — Exaggerated mouth */}
          <path d="M30 75 Q50 88 70 75" fill="none" stroke="#0A0A0A" strokeWidth="2" />
          <path d="M30 75 Q50 72 70 75" fill="#0A0A0A" opacity="0.3" />
          <rect x="45" y="76" width="4" height="6" rx="2" fill="#0A0A0A" opacity="0.5" />
          <rect x="51" y="76" width="4" height="6" rx="2" fill="#0A0A0A" opacity="0.5" />
        </>
      ) : (
        <>
          <path d="M32 74 Q50 82 68 74" fill="none" stroke="#0A0A0A" strokeWidth="1.5" />
          <path d="M34 74 Q50 80 66 74" stroke="#DC2626" strokeWidth="1.5" fill="#DC2626" opacity="0.4" />
        </>
      )}

      {/* === CATEGORY-SPECIFIC FACE PATTERNS === */}
      {isJing && (
        <>
          {/* 净 — Forehead pattern (flame/taijitu) */}
          <path d="M42 22 Q44 26 46 24 Q48 28 50 24 Q52 28 54 24 Q56 26 58 22" fill="none" stroke={light} strokeWidth="1" opacity="0.6" />
          <path d="M40 24 Q50 18 60 24" fill="none" stroke={light} strokeWidth="0.8" opacity="0.4" />
          {/* Cheek swirls */}
          <path d="M15 50 Q20 55 25 50 Q20 58 15 55" fill="none" stroke={light} strokeWidth="0.8" opacity="0.5" />
          <path d="M75 50 Q80 55 85 50 Q80 58 75 55" fill="none" stroke={light} strokeWidth="0.8" opacity="0.5" />
          {/* Nose bridge pattern */}
          <path d="M48 28 Q50 26 52 28 Q50 32 48 28" fill={accent} opacity="0.3" />
          {/* Chin decoration */}
          <path d="M45 90 Q50 87 55 90" fill="none" stroke={light} strokeWidth="1" opacity="0.4" />
        </>
      )}

      {isSheng && (
        <>
          {/* 生 — Red forehead mark */}
          <rect x="47" y="22" width="6" height="10" rx="3" fill="#DC2626" opacity="0.25" />
          {/* Subtle cheek blush */}
          <ellipse cx="22" cy="55" rx="6" ry="4" fill="#DC2626" opacity="0.08" />
          <ellipse cx="78" cy="55" rx="6" ry="4" fill="#DC2626" opacity="0.08" />
        </>
      )}

      {isChou && (
        <>
          {/* 丑 — White nose patch */}
          <ellipse cx="50" cy="50" rx="14" ry="12" fill="#F5F5F0" opacity="0.4" />
          {/* Spot marks */}
          <circle cx="45" cy="52" r="1" fill="#0A0A0A" opacity="0.3" />
          <circle cx="55" cy="52" r="1" fill="#0A0A0A" opacity="0.3" />
          {/* Wrinkle lines around eyes */}
          <path d="M18 50 Q20 53 24 50" fill="none" stroke="#0A0A0A" strokeWidth="0.5" opacity="0.3" />
          <path d="M76 50 Q80 53 82 50" fill="none" stroke="#0A0A0A" strokeWidth="0.5" opacity="0.3" />
        </>
      )}

      {isDan && (
        <>
          {/* 旦 — Blush */}
          <ellipse cx="22" cy="50" rx="7" ry="5" fill="#DC2626" opacity="0.08" />
          <ellipse cx="78" cy="50" rx="7" ry="5" fill="#DC2626" opacity="0.08" />
          {/* Teardrop mark */}
          <path d="M35 52 Q36 50 37 52 Q36 55 35 52" fill="#DC2626" opacity="0.15" />
          <path d="M65 52 Q66 50 67 52 Q66 55 65 52" fill="#DC2626" opacity="0.15" />
        </>
      )}

      {/* === NECK === */}
      <rect x="40" y="98" width="20" height="6" rx="3" fill={light} opacity="0.6" />

      {/* === COLLAR === */}
      <path d="M28 100 Q50 110 72 100 L75 105 Q50 118 25 105Z" fill="#0A0A0A" opacity="0.6" />
    </svg>
  )
}

export default function FaceGenerator() {
  const { roles, plays, loaded, error, loadData } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const selectedRole = searchParams.get('role') || ''
  useEffect(() => { if (!loaded) loadData() }, [loaded, loadData])

  const [searchRole, setSearchRole] = useState('')

  const coloredRoles = useMemo(() => {
    return roles.filter(r => r.type && !r.generic).sort((a, b) => {
      const order = ['生', '旦', '净', '丑']
      return (order.indexOf(a.category) - order.indexOf(b.category)) || (a.name.localeCompare(b.name))
    })
  }, [roles])

  const filteredRoles = useMemo(() => {
    if (!searchRole) return coloredRoles
    const q = searchRole.toLowerCase()
    return coloredRoles.filter(r => r.name.toLowerCase().includes(q))
  }, [coloredRoles, searchRole])

  const currentRole = useMemo(() => {
    if (!selectedRole) return null
    return roles.find(r => r.name === selectedRole)
  }, [selectedRole, roles])

  const rolePlays = useMemo(() => {
    if (!currentRole || !plays.length) return []
    return plays.filter(p => p.roleTypes && currentRole.name in p.roleTypes)
  }, [currentRole, plays])

  const setRole = (name) => {
    if (name) {
      setSearchParams({ role: name }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

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

  const fc = currentRole ? getRoleColor(currentRole) : null
  const colorInfo = currentRole ? getColorLabel(currentRole) : ''

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="text-gold-600/50 text-sm font-title tracking-[0.5em] select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
          脸谱生成
        </div>
        <div className="page-title-wrap flex-1">
          <h2 className="font-title text-2xl text-gold-500 flex items-center gap-2">
            <span className="text-vermillion-600 text-sm">◆</span>
            脸谱生成
          </h2>
          <p className="text-ink-500 text-xs mt-1 ml-4">角色数据映射为脸谱视觉符号</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* role selector */}
        <div className="lg:col-span-2">
          <div className="opera-card p-5">
            <h3 className="section-header text-xs text-ink-600/60 mb-3">选择角色</h3>
            <input type="text" placeholder="搜索角色..." value={searchRole}
              onChange={e => setSearchRole(e.target.value)}
              className="w-full bg-white/80 border border-ink-600/30 rounded px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500
                         focus:outline-none focus:border-gold-500/50 mb-3 transition-colors"
            />
            <div className="max-h-[520px] overflow-y-auto space-y-0.5">
              {filteredRoles.length > 100 && (
                <p className="text-ink-600 text-xs px-3 pb-1">前 100 个角色，输入名称搜索更多</p>
              )}
              {filteredRoles.slice(0, 100).map(r => (
                <button
                  key={r.name}
                  onClick={() => setRole(r.name)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded transition-all duration-200
                    ${selectedRole === r.name ? 'bg-gold-500/10 text-gold-400' : 'text-ink-600/50 hover:text-ink-600/70 hover:bg-paper-200/70'}`}
                >
                  <span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle border border-ink-600/30"
                    style={{ backgroundColor: getRoleColor(r) }} />
                  {r.name}
                  <span className="text-ink-500 ml-1">({r.type})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* face display */}
        <div className="lg:col-span-3">
          {currentRole ? (
            <>
              <div className="opera-card p-8 mb-4 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* face SVG — with flip animation */}
                  <div className="w-56 h-64 shrink-0 perspective-[600px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentRole.name}
                        initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                        exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, ease: [0.68, -0.55, 0.27, 1.55] }}
                        className="w-full h-full"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <OperaFace category={currentRole.category} color={fc} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {/* info */}
                  <div className="space-y-3">
                    <h3 className="font-title text-2xl text-gold-400">{currentRole.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm px-3 py-1 bg-white/80 rounded text-ink-600/70">{currentRole.type}</span>
                      <span className="text-sm px-3 py-1 bg-white/80 rounded text-ink-600/70">{currentRole.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-ink-600/30" style={{ backgroundColor: fc }} />
                      {colorInfo ? (
                        <span className="text-sm text-ink-600/70">脸谱色：{colorInfo}</span>
                      ) : (
                        <span className="text-sm text-ink-600/70">{currentRole.type} · {currentRole.category}行</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500">出现于 {rolePlays.length} 部剧目</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rolePlays.slice(0, 6).map(p => (
                        <button
                          key={p.id}
                          onClick={() => navigate(`/plays?search=${encodeURIComponent(p.title)}`)}
                          className="text-xs text-ink-500 bg-paper-200/70 px-2.5 py-1 rounded hover:text-gold-400 transition-colors"
                        >
                          {p.title}
                        </button>
                      ))}
                      {rolePlays.length > 6 && <span className="text-xs text-ink-500">等 {rolePlays.length} 部</span>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="opera-card flex items-center justify-center p-10" style={{ minHeight: 400 }}>
              <p className="text-ink-500 text-base">请选择一个角色查看脸谱</p>
            </div>
          )}

          <div className="opera-card p-5">
            <h3 className="section-header text-xs text-ink-600/60 mb-3">脸谱颜色寓意</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(FACE_COLORS).map(([color, info]) => (
                <div key={color} className="flex items-center gap-2 text-sm text-ink-600/50">
                  <div className="w-5 h-5 rounded border border-ink-600/30 shrink-0" style={{ backgroundColor: info.fill }} />
                  <span>{color} — {info.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

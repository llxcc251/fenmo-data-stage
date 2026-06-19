import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { CATEGORY_COLORS } from '../constants'

const CATEGORY_GLOWS = {
  '生': 'rgba(99,102,241,0.4)',
  '旦': 'rgba(239,68,68,0.4)',
  '净': 'rgba(245,158,11,0.4)',
  '丑': 'rgba(107,114,128,0.4)',
  '其他': 'rgba(58,58,58,0.4)',
}

// ---- Ink-wash radial gradient IDs ----
const INK_GRADIENT = [
  { id: 'ink-grad-1', cx: '20%', cy: '20%', stops: [{ offset: 0, color: 'rgba(220,38,38,0.04)' }, { offset: 1, color: 'transparent' }] },
  { id: 'ink-grad-2', cx: '80%', cy: '70%', stops: [{ offset: 0, color: 'rgba(245,158,11,0.03)' }, { offset: 1, color: 'transparent' }] },
  { id: 'ink-grad-3', cx: '50%', cy: '90%', stops: [{ offset: 0, color: 'rgba(99,102,241,0.03)' }, { offset: 1, color: 'transparent' }] },
]

export default function ForceGraph({ selectedRoles, relations, width = 800, height = 450, onNodeClick }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const simRef = useRef(null)

  // ---- Build co-occurrence graph ----
  const graph = useMemo(() => {
    if (!selectedRoles.length || !relations.length) return { nodes: [], links: [] }

    const roleSet = new Set(selectedRoles.map(r => r.name))
    const roleMap = {}
    selectedRoles.forEach(r => { roleMap[r.name] = r })

    const playGroups = {}
    relations.forEach(rel => {
      if (!roleSet.has(rel.role)) return
      if (!playGroups[rel.play]) playGroups[rel.play] = []
      playGroups[rel.play].push(rel.role)
    })

    const degree = {}
    selectedRoles.forEach(r => { degree[r.name] = 0 })
    Object.values(playGroups).forEach(roles => {
      roles.forEach(r => { degree[r] = (degree[r] || 0) + 1 })
    })

    const edgeMap = {}
    Object.values(playGroups).forEach(roles => {
      if (roles.length < 2) return
      for (let i = 0; i < roles.length; i++) {
        for (let j = i + 1; j < roles.length; j++) {
          const a = roles[i], b = roles[j]
          if (a === b) continue
          const key = a < b ? `${a}|${b}` : `${b}|${a}`
          edgeMap[key] = (edgeMap[key] || 0) + 1
        }
      }
    })

    const topRoleNames = Object.entries(degree)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name]) => name)
    const topSet = new Set(topRoleNames)

    const nodes = topRoleNames.map(name => ({
      id: name,
      ...roleMap[name],
      degree: degree[name] || 0,
    }))

    const links = []
    Object.entries(edgeMap).forEach(([key, weight]) => {
      const [a, b] = key.split('|')
      if (topSet.has(a) && topSet.has(b)) {
        links.push({ source: a, target: b, weight: Math.min(weight, 20) })
      }
    })

    return { nodes, links }
  }, [selectedRoles, relations])

  // ---- D3 force simulation ----
  useEffect(() => {
    if (!graph.nodes.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const w = containerRef.current?.clientWidth || width
    const h = containerRef.current?.clientHeight || height

    // === 1. DEFS ===
    const defs = svg.append('defs')

    // Node glow filters — more dramatic
    Object.entries(CATEGORY_GLOWS).forEach(([cat, color]) => {
      defs.append('filter')
        .attr('id', `glow-${cat}`)
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%')
        .append('feDropShadow')
        .attr('dx', 0).attr('dy', 0)
        .attr('stdDeviation', 6)
        .attr('flood-color', color)
        .attr('flood-opacity', 0.9)
    })

    // Stronger glow for hover state
    Object.entries(CATEGORY_GLOWS).forEach(([cat, color]) => {
      const f = defs.append('filter')
        .attr('id', `glow-${cat}-strong`)
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%')
      f.append('feDropShadow')
        .attr('dx', 0).attr('dy', 0)
        .attr('stdDeviation', 12)
        .attr('flood-color', color)
        .attr('flood-opacity', 1)
    })

    // Ink-wash background radial gradients
    INK_GRADIENT.forEach(g => {
      const rg = defs.append('radialGradient').attr('id', g.id).attr('cx', g.cx).attr('cy', g.cy).attr('r', '60%')
      g.stops.forEach(s => rg.append('stop').attr('offset', s.offset).attr('stop-color', s.color))
    })

    // Subtle dot-grid pattern
    defs.append('pattern')
      .attr('id', 'dot-grid').attr('width', 24).attr('height', 24).attr('patternUnits', 'userSpaceOnUse')
      .append('circle').attr('cx', 12).attr('cy', 12).attr('r', 0.5).attr('fill', '#3A3A3A').attr('opacity', 0.2)

    // === 2. BACKGROUND — ink-wash atmosphere ===
    const bg = svg.append('g')
    bg.append('rect').attr('width', w).attr('height', h).attr('fill', '#F5F0E6')

    // Subtle dot-grid texture
    bg.append('rect').attr('width', w).attr('height', h)
      .attr('fill', 'url(#dot-grid)')

    // Ink-wash blobs
    INK_GRADIENT.forEach(g => {
      bg.append('rect').attr('width', w).attr('height', h).attr('fill', `url(#${g.id})`)
    })

    // === 3. ZOOM ===
    const g = svg.append('g')
    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => { g.attr('transform', event.transform) })
    )

    // === 4. LINKS ===
    const linkGroup = g.append('g').attr('class', 'links')
    const link = linkGroup.selectAll('line')
      .data(graph.links)
      .join('line')
      .attr('stroke', d => {
        const sc = CATEGORY_COLORS[d.source.category] || '#6B7280'
        const tc = CATEGORY_COLORS[d.target.category] || '#6B7280'
        // Use source color with gradient toward target — we'll use a linear gradient per link
        return sc
      })
      .attr('stroke-width', d => Math.sqrt(d.weight) * 0.6 + 0.3)
      .attr('stroke-opacity', d => Math.min(0.2 + d.weight * 0.02, 0.45))

    // Per-link linear gradients for source→target color blend
    link.each(function (d) {
      const sc = CATEGORY_COLORS[d.source.category] || '#6B7280'
      const tc = CATEGORY_COLORS[d.target.category] || '#6B7280'
      const lid = `lg-${d.source.id}-${d.target.id}`.replace(/\s/g, '_')
      const lg = defs.append('linearGradient')
        .attr('id', lid)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%')
      lg.append('stop').attr('offset', '0%').attr('stop-color', sc).attr('stop-opacity', 0.4)
      lg.append('stop').attr('offset', '100%').attr('stop-color', tc).attr('stop-opacity', 0.4)
      d3.select(this).attr('stroke', `url(#${lid})`)
    })

    // === 5. NODES ===
    const nodeGroup = g.append('g').selectAll('g').data(graph.nodes).join('g')

    // Outer glow circles (always visible, subtle)
    nodeGroup.append('circle')
      .attr('class', 'glow-ring')
      .attr('r', d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18) + 4)
      .attr('fill', 'none')
      .attr('stroke', d => CATEGORY_COLORS[d.category] || '#6B7280')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.15)
      .attr('pointer-events', 'none')

    // Main node circles
    const node = nodeGroup.append('circle')
      .attr('r', d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18))
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#6B7280')
      .attr('stroke', '#0A0A0A')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')

    // === 6. LABELS ===
    const labelGroup = nodeGroup.filter(d => d.degree > 2)
    const labelBg = labelGroup.append('rect')
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', '#1A1A1A')
      .attr('fill-opacity', 0.75)
      .attr('stroke', '#3A3A3A')
      .attr('stroke-width', 0.5)
      .attr('pointer-events', 'none')

    const label = labelGroup.append('text')
      .text(d => d.id)
      .attr('font-size', 9)
      .attr('fill', '#D4D4C8')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('pointer-events', 'none')

    label.each(function () {
      const bbox = this.getBBox()
      d3.select(this.parentNode).select('rect')
        .attr('x', bbox.x - 5)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 10)
        .attr('height', bbox.height + 4)
    })

    // === 7. INTERACTION EVENTS ===
    node.on('mouseenter', function (event, d) {
      // Tooltip
      const rect = svgRef.current.getBoundingClientRect()
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        name: d.id,
        type: d.type || '未知',
        category: d.category || '未知',
        degree: d.degree,
      })
      // Highlight
      node.attr('opacity', n => {
        if (n.id === d.id) return 1
        const connected = graph.links.some(
          l => (l.source.id || l.source) === d.id && (l.target.id || l.target) === n.id
            || (l.target.id || l.target) === d.id && (l.source.id || l.source) === n.id
        )
        return connected ? 0.85 : 0.12
      })
      link.attr('stroke-opacity', l => {
        const sid = l.source.id || l.source
        const tid = l.target.id || l.target
        return sid === d.id || tid === d.id ? 0.7 : 0.02
      })
        .attr('stroke-width', l => {
          const sid = l.source.id || l.source
          const tid = l.target.id || l.target
          return sid === d.id || tid === d.id ? Math.sqrt(l.weight) * 1.2 + 0.5 : Math.sqrt(l.weight) * 0.6 + 0.3
        })

      // Strong glow
      d3.select(this)
        .attr('filter', `url(#glow-${d.category || '其他'}-strong)`)
        .attr('stroke', '#D4D4C8').attr('stroke-width', 2.5)

      // Pulse glow ring
      d3.select(this.parentNode).select('.glow-ring')
        .transition().duration(200)
        .attr('stroke-opacity', 0.6)
        .attr('r', parseFloat(d3.select(this).attr('r')) + 8)

    }).on('mouseleave', function () {
      setTooltip(null)
      node.attr('opacity', 1)
      link.attr('stroke-opacity', l => Math.min(0.2 + l.weight * 0.02, 0.45))
        .attr('stroke-width', l => Math.sqrt(l.weight) * 0.6 + 0.3)

      d3.select(this)
        .attr('filter', null)
        .attr('stroke', '#0A0A0A').attr('stroke-width', 1.5)

      nodeGroup.select('.glow-ring')
        .transition().duration(300)
        .attr('stroke-opacity', 0.15)
        .attr('r', d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18) + 4)

    }).on('dblclick', (event, d) => {
      if (onNodeClick) onNodeClick(d.id)
    })

    // === 8. FORCE SIMULATION ===
    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18) + 10))
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        nodeGroup
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })

    // === 9. DRAG ===
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    nodeGroup.call(drag)

    simRef.current = simulation

    return () => { simulation.stop() }
  }, [graph, width, height, onNodeClick])

  if (!graph.nodes.length) {
    return (
      <div className="flex items-center justify-center text-center py-16">
        <div>
          <p className="text-ink-500 text-sm mb-1">暂无角色同现关系</p>
          <p className="text-ink-600 text-xs">该朝代的角色间缺少共同出演的剧目数据</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg border border-ink-600/15" style={{ height }}>
      <svg ref={svgRef} className="w-full h-full" />
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-ink-800/90 border border-ink-600/50 rounded px-3 py-2 text-xs space-y-1 backdrop-blur-sm"
          style={{ left: Math.min(tooltip.x, width - 160), top: Math.max(tooltip.y - 60, 0) }}
        >
          <p className="text-gold-400 font-title text-sm">{tooltip.name}</p>
          <p className="text-jade-200/60">
            <span className="text-ink-500">行当：</span>{tooltip.category} · {tooltip.type}
          </p>
          <p className="text-jade-200/60">
            <span className="text-ink-500">参演：</span>{tooltip.degree} 部剧目
          </p>
        </div>
      )}
      {/* Legend */}
      <div className="absolute top-2 right-2 flex gap-3 text-xs text-ink-600/60 z-10">
        {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== '其他').map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
            }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}

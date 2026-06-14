import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import * as d3 from 'd3'

const CATEGORY_COLORS = {
  '生': '#6366F1', '旦': '#EF4444', '净': '#F59E0B', '丑': '#6B7280', '其他': '#3A3A3A'
}

const CATEGORY_GLOWS = {
  '生': 'rgba(99,102,241,0.3)', '旦': 'rgba(239,68,68,0.3)', '净': 'rgba(245,158,11,0.3)', '丑': 'rgba(107,114,128,0.3)', '其他': 'rgba(58,58,58,0.3)'
}

export default function ForceGraph({ selectedRoles, relations, width = 800, height = 450, onNodeClick }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const simRef = useRef(null)

  // Build co-occurrence graph
  const graph = useMemo(() => {
    if (!selectedRoles.length || !relations.length) return { nodes: [], links: [] }

    const roleSet = new Set(selectedRoles.map(r => r.name))
    const roleMap = {}
    selectedRoles.forEach(r => { roleMap[r.name] = r })

    // Group relations by play
    const playGroups = {}
    relations.forEach(rel => {
      if (!roleSet.has(rel.role)) return
      if (!playGroups[rel.play]) playGroups[rel.play] = []
      playGroups[rel.play].push(rel.role)
    })

    // Count role-play appearances (degree)
    const degree = {}
    selectedRoles.forEach(r => { degree[r.name] = 0 })
    Object.values(playGroups).forEach(roles => {
      roles.forEach(r => { degree[r] = (degree[r] || 0) + 1 })
    })

    // Build edges: for each play, pair up all roles
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

    // Top roles by degree
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

  // D3 force simulation
  useEffect(() => {
    if (!graph.nodes.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const w = containerRef.current?.clientWidth || width
    const h = containerRef.current?.clientHeight || height

    // Defs: glow filter + gradients
    const defs = svg.append('defs')
    Object.entries(CATEGORY_GLOWS).forEach(([cat, color]) => {
      defs.append('filter')
        .attr('id', `glow-${cat}`)
        .append('feDropShadow')
        .attr('dx', 0).attr('dy', 0)
        .attr('stdDeviation', 4)
        .attr('flood-color', color)
        .attr('flood-opacity', 0.8)
    })
    // Link gradient
    const lg = defs.append('linearGradient').attr('id', 'link-grad').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%')
    lg.append('stop').attr('offset', '0%').attr('stop-color', '#3A3A3A').attr('stop-opacity', 0.1)
    lg.append('stop').attr('offset', '100%').attr('stop-color', '#3A3A3A').attr('stop-opacity', 0.6)

    // Zoom
    const g = svg.append('g')
    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => { g.attr('transform', event.transform) })
    )

    // Background dot pattern
    g.append('pattern')
      .attr('id', 'dot-grid').attr('width', 20).attr('height', 20).attr('patternUnits', 'userSpaceOnUse')
      .append('circle').attr('cx', 10).attr('cy', 10).attr('r', 0.6).attr('fill', '#3A3A3A').attr('opacity', 0.3)
    g.append('rect').attr('width', w).attr('height', h).attr('fill', 'url(#dot-grid)')

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(graph.links)
      .join('line')
      .attr('stroke', d => {
        const c = CATEGORY_COLORS[d.source.category] || '#6B7280'
        return c
      })
      .attr('stroke-width', d => Math.sqrt(d.weight) * 0.6 + 0.3)
      .attr('stroke-opacity', d => Math.min(0.15 + d.weight * 0.02, 0.4))

    // Nodes group
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')

    // Node circles
    const node = nodeGroup.append('circle')
      .attr('r', d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18))
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#6B7280')
      .attr('stroke', '#0A0A0A')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')

    // Labels with background pill
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

    // Update label bg size after text renders
    label.each(function () {
      const bbox = this.getBBox()
      d3.select(this.parentNode).select('rect')
        .attr('x', bbox.x - 5)
        .attr('y', bbox.y - 2)
        .attr('width', bbox.width + 10)
        .attr('height', bbox.height + 4)
    })

    // Position labels above nodes
    const labelOffset = (d) => {
      const r = Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18)
      return -r - 12
    }

    // Tooltip events
    node.on('mouseenter', function (event, d) {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        name: d.id,
        type: d.type || '未知',
        category: d.category || '未知',
        degree: d.degree,
      })
      // Highlight connected nodes
      node.attr('opacity', n => {
        if (n.id === d.id) return 1
        const connected = graph.links.some(
          l => (l.source.id || l.source) === d.id && (l.target.id || l.target) === n.id
            || (l.target.id || l.target) === d.id && (l.source.id || l.source) === n.id
        )
        return connected ? 0.8 : 0.15
      })
      link.attr('stroke-opacity', l => {
        const sid = l.source.id || l.source
        const tid = l.target.id || l.target
        return sid === d.id || tid === d.id ? 0.6 : 0.03
      })
      // Glow on hover
      d3.select(this).attr('filter', `url(#glow-${d.category || '其他'})`)
        .attr('stroke', '#D4D4C8').attr('stroke-width', 2)
    }).on('mouseleave', function () {
      setTooltip(null)
      node.attr('opacity', 1)
      link.attr('stroke-opacity', l => Math.min(0.15 + l.weight * 0.02, 0.4))
      d3.select(this).attr('filter', null).attr('stroke', '#0A0A0A').attr('stroke-width', 1.5)
    }).on('dblclick', (event, d) => {
      if (onNodeClick) onNodeClick(d.id)
    })

    // Force
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

    // Drag
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
  }, [graph, width, height])

  if (!graph.nodes.length) {
    return (
      <div className="flex items-center justify-center text-center py-16">
        <div>
          <p className="text-ink-500 text-sm mb-1">暂无角色同现关系</p>
          <p className="text-ink-600 text-[10px]">该朝代的角色间缺少共同出演的剧目数据</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg" style={{ height }}>
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
      <div className="absolute top-2 right-2 flex gap-3 text-[10px] text-ink-600/60 z-10">
        {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== '其他').map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}

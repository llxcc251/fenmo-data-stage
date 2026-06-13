import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import * as d3 from 'd3'

const CATEGORY_COLORS = {
  '生': '#6366F1', '旦': '#EF4444', '净': '#F59E0B', '丑': '#6B7280', '其他': '#3A3A3A'
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
    const width = svgRef.current.clientWidth || width
    const height = svgRef.current.clientHeight || height

    // Zoom
    const g = svg.append('g')
    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => { g.attr('transform', event.transform) })
    )

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(graph.links)
      .join('line')
      .attr('stroke', '#3A3A3A')
      .attr('stroke-width', d => Math.sqrt(d.weight) * 0.8)
      .attr('stroke-opacity', 0.4)

    // Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graph.nodes)
      .join('circle')
      .attr('r', d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18))
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#6B7280')
      .attr('stroke', '#0A0A0A')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .style('transition', 'stroke-opacity 0.2s')

    // Labels (only for nodes with degree > threshold)
    const label = g.append('g')
      .selectAll('text')
      .data(graph.nodes.filter(d => d.degree > 2))
      .join('text')
      .text(d => d.id)
      .attr('font-size', 9)
      .attr('fill', '#D4D4C8')
      .attr('text-anchor', 'middle')
      .attr('dy', d => -Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18) - 4)
      .attr('pointer-events', 'none')
      .attr('opacity', 0.7)

    // Tooltip events
    node.on('mouseenter', (event, d) => {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        name: d.id,
        type: d.type || '未知',
        category: d.category || '未知',
        degree: d.degree,
      })
      node.attr('opacity', n => {
        if (n.id === d.id) return 1
        const connected = graph.links.some(
          l => (l.source.id || l.source) === d.id && (l.target.id || l.target) === n.id
            || (l.target.id || l.target) === d.id && (l.source.id || l.source) === n.id
        )
        return connected ? 0.8 : 0.2
      })
      link.attr('stroke-opacity', l => {
        const sid = l.source.id || l.source
        const tid = l.target.id || l.target
        return sid === d.id || tid === d.id ? 0.6 : 0.05
      })
    }).on('mouseleave', () => {
      setTooltip(null)
      node.attr('opacity', 1)
      link.attr('stroke-opacity', 0.4)
    }).on('dblclick', (event, d) => {
      if (onNodeClick) onNodeClick(d.id)
    })

    // Force
    const simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.min(Math.max(Math.sqrt(d.degree) * 2, 5), 18) + 5))
      .on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
        label
          .attr('x', d => d.x)
          .attr('y', d => d.y)
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
    node.call(drag)

    simRef.current = simulation

    return () => { simulation.stop() }
  }, [graph, width, height])

  if (!graph.nodes.length) {
    return (
      <div className="flex items-center justify-center text-ink-500 text-sm py-16">
        <p>暂无数据</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg" style={{ height }}>
      <svg ref={svgRef} className="w-full h-full" />
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 bg-ink-700/90 border border-ink-600/50 rounded px-3 py-2 text-xs space-y-1 backdrop-blur-sm"
          style={{ left: Math.min(tooltip.x, width - 160), top: Math.max(tooltip.y - 60, 0) }}
        >
          <p className="text-gold-400 font-title">{tooltip.name}</p>
          <p className="text-jade-200/60">
            <span className="text-ink-500">行当：</span>{tooltip.category} · {tooltip.type}
          </p>
          <p className="text-jade-200/60">
            <span className="text-ink-500">参演：</span>{tooltip.degree} 部剧目
          </p>
        </div>
      )}
      {/* Legend */}
      <div className="absolute top-2 right-2 flex gap-3 text-[10px] text-jade-200/50 z-10">
        {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== '其他').map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  )
}

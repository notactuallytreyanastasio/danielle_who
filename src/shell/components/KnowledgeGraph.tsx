import { useState, useEffect, useMemo } from 'react'
import type { GraphData, GraphNode, GraphIndex } from '@core/graph-data'
import {
  buildGraphIndex,
  searchNodes,
  getConnectedNodes,
  getGraphStats,
  getDoctorNodes,
  getCompanionNodes,
  getEnemyNodes,
  getLocationNodes,
} from '@core/graph-data'

type Category = 'all' | 'doctors' | 'companions' | 'enemies' | 'locations' | 'stories'

function NodeCard({
  node,
  index,
  onSelect,
  isSelected,
}: {
  node: GraphNode
  index: GraphIndex
  onSelect: (node: GraphNode) => void
  isSelected: boolean
}) {
  const connected = useMemo(() => getConnectedNodes(index, node.id), [index, node.id])

  const typeColors: Record<string, string> = {
    goal: '#4a90d9',
    decision: '#9b59b6',
    action: '#27ae60',
    outcome: '#f39c12',
    observation: '#3498db',
    option: '#e74c3c',
    revisit: '#95a5a6',
  }

  return (
    <div
      className={`graph-node-card ${isSelected ? 'graph-node-card--selected' : ''}`}
      onClick={() => onSelect(node)}
      style={{ borderLeftColor: typeColors[node.node_type] ?? '#ccc' }}
    >
      <div className="graph-node-card__header">
        <span
          className="graph-node-card__type"
          style={{ backgroundColor: typeColors[node.node_type] ?? '#ccc' }}
        >
          {node.node_type}
        </span>
        <span className="graph-node-card__id">#{node.id}</span>
      </div>
      <h4 className="graph-node-card__title">{node.title}</h4>
      {connected.length > 0 && (
        <div className="graph-node-card__connections">
          {connected.length} connection{connected.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

function NodeDetail({
  node,
  index,
  onNavigate,
}: {
  node: GraphNode
  index: GraphIndex
  onNavigate: (node: GraphNode) => void
}) {
  const connectedFrom = useMemo(
    () => getConnectedNodes(index, node.id, 'from'),
    [index, node.id]
  )
  const connectedTo = useMemo(
    () => getConnectedNodes(index, node.id, 'to'),
    [index, node.id]
  )

  const metadata = useMemo(() => {
    try {
      return JSON.parse(node.metadata_json)
    } catch {
      return {}
    }
  }, [node.metadata_json])

  return (
    <div className="node-detail">
      <div className="node-detail__header">
        <span className="node-detail__type">{node.node_type}</span>
        <h3 className="node-detail__title">{node.title}</h3>
        <span className="node-detail__id">Node #{node.id}</span>
      </div>

      {node.description && (
        <div className="node-detail__section">
          <h4>Description</h4>
          <p>{node.description}</p>
        </div>
      )}

      {metadata.prompt && (
        <div className="node-detail__section">
          <h4>Context</h4>
          <p className="node-detail__prompt">{metadata.prompt}</p>
        </div>
      )}

      {metadata.confidence && (
        <div className="node-detail__meta">
          <span>Confidence: {metadata.confidence}%</span>
        </div>
      )}

      {connectedTo.length > 0 && (
        <div className="node-detail__section">
          <h4>Connected From ({connectedTo.length})</h4>
          <div className="node-detail__connections">
            {connectedTo.slice(0, 10).map((n) => (
              <button
                key={n.id}
                className="node-detail__connection"
                onClick={() => onNavigate(n)}
              >
                <span className="node-detail__connection-type">{n.node_type}</span>
                <span className="node-detail__connection-title">{n.title}</span>
              </button>
            ))}
            {connectedTo.length > 10 && (
              <span className="node-detail__more">
                +{connectedTo.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {connectedFrom.length > 0 && (
        <div className="node-detail__section">
          <h4>Connected To ({connectedFrom.length})</h4>
          <div className="node-detail__connections">
            {connectedFrom.slice(0, 10).map((n) => (
              <button
                key={n.id}
                className="node-detail__connection"
                onClick={() => onNavigate(n)}
              >
                <span className="node-detail__connection-type">{n.node_type}</span>
                <span className="node-detail__connection-title">{n.title}</span>
              </button>
            ))}
            {connectedFrom.length > 10 && (
              <span className="node-detail__more">
                +{connectedFrom.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="node-detail__footer">
        <span>Status: {node.status}</span>
        <span>Created: {new Date(node.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export function KnowledgeGraph() {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    async function loadGraph() {
      try {
        const response = await fetch('/data/graph-data.json')
        if (!response.ok) {
          throw new Error(`Failed to load graph: ${response.status}`)
        }
        const data = await response.json()
        setGraphData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    void loadGraph()
  }, [])

  const index = useMemo(() => {
    if (!graphData) return null
    return buildGraphIndex(graphData)
  }, [graphData])

  const stats = useMemo(() => {
    if (!graphData || !index) return null
    return getGraphStats(graphData, index)
  }, [graphData, index])

  const filteredNodes = useMemo(() => {
    if (!index) return []

    // Apply search filter first
    let nodes: GraphNode[]
    if (searchQuery.trim()) {
      nodes = searchNodes(index, searchQuery)
    } else {
      nodes = Array.from(index.nodesById.values())
    }

    // Then apply category filter
    switch (category) {
      case 'doctors':
        return getDoctorNodes(index).filter(
          (n) => !searchQuery || nodes.some((sn) => sn.id === n.id)
        )
      case 'companions':
        return getCompanionNodes(index).filter(
          (n) => !searchQuery || nodes.some((sn) => sn.id === n.id)
        )
      case 'enemies':
        return getEnemyNodes(index).filter(
          (n) => !searchQuery || nodes.some((sn) => sn.id === n.id)
        )
      case 'locations':
        return getLocationNodes(index).filter(
          (n) => !searchQuery || nodes.some((sn) => sn.id === n.id)
        )
      case 'stories':
        // Filter to observation nodes that look like stories
        return nodes.filter(
          (n) =>
            n.node_type === 'observation' &&
            !n.title.toLowerCase().includes(':') &&
            n.title.length > 5
        )
      default:
        return nodes
    }
  }, [index, searchQuery, category])

  if (loading) {
    return (
      <div className="knowledge-graph">
        <div className="loading">
          <div className="loading__spinner" />
          <div className="loading__text">Loading knowledge graph...</div>
        </div>
      </div>
    )
  }

  if (error || !graphData || !index) {
    return (
      <div className="knowledge-graph">
        <div className="loading">
          <div className="loading__text" style={{ color: 'var(--class-accent)' }}>
            Error: {error ?? 'Failed to load graph'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="knowledge-graph">
      <div className="knowledge-graph__header">
        <h2>Knowledge Graph</h2>
        <p className="knowledge-graph__subtitle">
          Explore {stats?.totalNodes.toLocaleString()} nodes with{' '}
          {stats?.totalEdges.toLocaleString()} connections
        </p>
      </div>

      {stats && (
        <div className="knowledge-graph__stats">
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.doctorCount}</span>
            <span className="stat-chip__label">Doctors</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.companionCount}</span>
            <span className="stat-chip__label">Companions</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.enemyCount}</span>
            <span className="stat-chip__label">Enemies</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__value">{stats.locationCount}</span>
            <span className="stat-chip__label">Locations</span>
          </div>
        </div>
      )}

      <div className="knowledge-graph__controls">
        <input
          type="text"
          className="knowledge-graph__search"
          placeholder="Search nodes... (e.g., 'Daleks', 'Rose Tyler', 'Gallifrey')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="knowledge-graph__categories">
          {(['all', 'doctors', 'companions', 'enemies', 'locations', 'stories'] as Category[]).map(
            (cat) => (
              <button
                key={cat}
                className={`category-btn ${category === cat ? 'category-btn--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      <div className="knowledge-graph__content">
        <div className="knowledge-graph__list">
          <div className="knowledge-graph__count">
            Showing {filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''}
          </div>
          <div className="knowledge-graph__nodes">
            {filteredNodes.slice(0, 100).map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                index={index}
                onSelect={setSelectedNode}
                isSelected={selectedNode?.id === node.id}
              />
            ))}
            {filteredNodes.length > 100 && (
              <div className="knowledge-graph__more">
                +{filteredNodes.length - 100} more nodes (refine your search)
              </div>
            )}
          </div>
        </div>

        {selectedNode && (
          <div className="knowledge-graph__detail">
            <NodeDetail
              node={selectedNode}
              index={index}
              onNavigate={(node) => setSelectedNode(node)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Knowledge graph data types and utilities
 * Loads and queries the deciduous knowledge graph
 */

export interface GraphNode {
  id: number
  change_id: string
  node_type: 'goal' | 'decision' | 'option' | 'action' | 'outcome' | 'observation' | 'revisit'
  title: string
  description: string | null
  status: 'pending' | 'active' | 'completed' | 'superseded'
  created_at: string
  updated_at: string
  metadata_json: string
}

export interface GraphEdge {
  id: number
  change_id: string
  from_node_id: number
  to_node_id: number
  edge_type: string
  rationale: string | null
  created_at: string
  metadata_json: string | null
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ParsedMetadata {
  branch?: string
  confidence?: number
  prompt?: string
  files?: string[]
  commit?: string
}

/**
 * Parse the metadata JSON from a node
 */
export function parseNodeMetadata(node: GraphNode): ParsedMetadata {
  try {
    return JSON.parse(node.metadata_json) as ParsedMetadata
  } catch {
    return {}
  }
}

/**
 * Build indexes for fast graph querying
 */
export interface GraphIndex {
  nodesById: Map<number, GraphNode>
  nodesByType: Map<string, GraphNode[]>
  edgesFrom: Map<number, GraphEdge[]>
  edgesTo: Map<number, GraphEdge[]>
  nodesByTitle: Map<string, GraphNode[]> // lowercase title -> nodes
}

export function buildGraphIndex(data: GraphData): GraphIndex {
  const nodesById = new Map<number, GraphNode>()
  const nodesByType = new Map<string, GraphNode[]>()
  const edgesFrom = new Map<number, GraphEdge[]>()
  const edgesTo = new Map<number, GraphEdge[]>()
  const nodesByTitle = new Map<string, GraphNode[]>()

  // Index nodes
  for (const node of data.nodes) {
    nodesById.set(node.id, node)

    const typeNodes = nodesByType.get(node.node_type) ?? []
    typeNodes.push(node)
    nodesByType.set(node.node_type, typeNodes)

    // Index by lowercase title words for search
    const titleWords = node.title.toLowerCase().split(/\s+/)
    for (const word of titleWords) {
      if (word.length > 2) {
        const wordNodes = nodesByTitle.get(word) ?? []
        wordNodes.push(node)
        nodesByTitle.set(word, wordNodes)
      }
    }
  }

  // Index edges
  for (const edge of data.edges) {
    const fromEdges = edgesFrom.get(edge.from_node_id) ?? []
    fromEdges.push(edge)
    edgesFrom.set(edge.from_node_id, fromEdges)

    const toEdges = edgesTo.get(edge.to_node_id) ?? []
    toEdges.push(edge)
    edgesTo.set(edge.to_node_id, toEdges)
  }

  return { nodesById, nodesByType, edgesFrom, edgesTo, nodesByTitle }
}

/**
 * Find nodes connected to a given node
 */
export function getConnectedNodes(
  index: GraphIndex,
  nodeId: number,
  direction: 'from' | 'to' | 'both' = 'both'
): GraphNode[] {
  const connected: GraphNode[] = []
  const seen = new Set<number>()

  if (direction === 'from' || direction === 'both') {
    const fromEdges = index.edgesFrom.get(nodeId) ?? []
    for (const edge of fromEdges) {
      if (!seen.has(edge.to_node_id)) {
        const node = index.nodesById.get(edge.to_node_id)
        if (node) {
          connected.push(node)
          seen.add(edge.to_node_id)
        }
      }
    }
  }

  if (direction === 'to' || direction === 'both') {
    const toEdges = index.edgesTo.get(nodeId) ?? []
    for (const edge of toEdges) {
      if (!seen.has(edge.from_node_id)) {
        const node = index.nodesById.get(edge.from_node_id)
        if (node) {
          connected.push(node)
          seen.add(edge.from_node_id)
        }
      }
    }
  }

  return connected
}

/**
 * Search nodes by title
 */
export function searchNodes(index: GraphIndex, query: string): GraphNode[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
  if (terms.length === 0) return []

  const scores = new Map<number, number>()

  for (const term of terms) {
    // Exact word match
    const exactMatches = index.nodesByTitle.get(term) ?? []
    for (const node of exactMatches) {
      scores.set(node.id, (scores.get(node.id) ?? 0) + 10)
    }

    // Partial matches
    for (const [word, nodes] of index.nodesByTitle) {
      if (word.includes(term) || term.includes(word)) {
        for (const node of nodes) {
          scores.set(node.id, (scores.get(node.id) ?? 0) + 3)
        }
      }
    }
  }

  // Sort by score and return nodes
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([id]) => index.nodesById.get(id)!)
    .filter(Boolean)
}

/**
 * Get all nodes of a specific type
 */
export function getNodesByType(index: GraphIndex, type: GraphNode['node_type']): GraphNode[] {
  return index.nodesByType.get(type) ?? []
}

/**
 * Find story/episode nodes
 */
export function getStoryNodes(index: GraphIndex): GraphNode[] {
  const storyNodes: GraphNode[] = []

  for (const node of index.nodesById.values()) {
    const title = node.title.toLowerCase()
    // Story nodes typically have episode/story identifiable patterns
    if (
      title.includes('story:') ||
      title.includes('episode:') ||
      // Many titles are just episode names
      (node.node_type === 'observation' && !title.includes(':') && title.length > 5)
    ) {
      storyNodes.push(node)
    }
  }

  return storyNodes
}

/**
 * Find Doctor nodes
 */
export function getDoctorNodes(index: GraphIndex): GraphNode[] {
  const doctors: GraphNode[] = []

  for (const node of index.nodesById.values()) {
    const title = node.title.toLowerCase()
    if (
      title.includes('doctor') &&
      (title.includes('first') || title.includes('second') || title.includes('third') ||
       title.includes('fourth') || title.includes('fifth') || title.includes('sixth') ||
       title.includes('seventh') || title.includes('eighth') || title.includes('ninth') ||
       title.includes('tenth') || title.includes('eleventh') || title.includes('twelfth') ||
       title.includes('thirteenth') || title.includes('fourteenth') || title.includes('fifteenth') ||
       title.includes('war'))
    ) {
      doctors.push(node)
    }
  }

  return doctors
}

/**
 * Find companion nodes
 */
export function getCompanionNodes(index: GraphIndex): GraphNode[] {
  const companions: GraphNode[] = []

  for (const node of index.nodesById.values()) {
    const title = node.title.toLowerCase()
    if (title.includes('companion:') || title.includes('companion -')) {
      companions.push(node)
    }
  }

  return companions
}

/**
 * Find enemy nodes
 */
export function getEnemyNodes(index: GraphIndex): GraphNode[] {
  const enemies: GraphNode[] = []

  for (const node of index.nodesById.values()) {
    const title = node.title.toLowerCase()
    if (
      title.includes('enemy:') ||
      title.includes('daleks') ||
      title.includes('cybermen') ||
      title.includes('master') ||
      title.includes('weeping angels') ||
      title.includes('sontaran') ||
      title.includes('ice warriors') ||
      title.includes('silurian')
    ) {
      enemies.push(node)
    }
  }

  return enemies
}

/**
 * Find location nodes
 */
export function getLocationNodes(index: GraphIndex): GraphNode[] {
  const locations: GraphNode[] = []

  for (const node of index.nodesById.values()) {
    const title = node.title.toLowerCase()
    if (title.includes('location:')) {
      locations.push(node)
    }
  }

  return locations
}

/**
 * Get graph statistics
 */
export function getGraphStats(data: GraphData, index: GraphIndex): {
  totalNodes: number
  totalEdges: number
  nodesByType: Record<string, number>
  doctorCount: number
  companionCount: number
  enemyCount: number
  locationCount: number
  storyCount: number
} {
  const nodesByType: Record<string, number> = {}
  for (const [type, nodes] of index.nodesByType) {
    nodesByType[type] = nodes.length
  }

  return {
    totalNodes: data.nodes.length,
    totalEdges: data.edges.length,
    nodesByType,
    doctorCount: getDoctorNodes(index).length,
    companionCount: getCompanionNodes(index).length,
    enemyCount: getEnemyNodes(index).length,
    locationCount: getLocationNodes(index).length,
    storyCount: getStoryNodes(index).length,
  }
}

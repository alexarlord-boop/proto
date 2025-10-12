import React, { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, Network, ChevronDown, ChevronUp } from 'lucide-react'
import { FullScreenPreview } from '../Editor/FullScreenPreview'

interface Column {
  name: string
  type: string
  nullable: boolean
  primary_key: boolean
}

interface ForeignKey {
  constrained_columns: string[]
  referred_table: string
  referred_columns: string[]
}

interface SchemaTable {
  name: string
  columns: Column[]
  primary_keys?: string[]
  foreign_keys?: ForeignKey[]
}

interface SchemaVisualizerProps {
  schema: SchemaTable[]
}

// Custom node component for table display
const TableNode = ({ data, selected }: any) => {
  // Identify which columns are involved in relationships
  const foreignKeyColumns = new Set(
    data.foreignKeys?.flatMap((fk: any) => fk.constrained_columns) || []
  )
  const referencedColumns = new Set(
    data.referencedBy?.map((ref: any) => ref.column) || []
  )

  return (
    <div className={`bg-white rounded-lg shadow-lg min-w-[240px] relative transition-all duration-200 ${
      selected 
        ? 'border-4 border-green-500 shadow-2xl ring-4 ring-green-200' 
        : 'border-2 border-slate-300'
    }`}>
      {/* Table Header */}
      <div className={`text-white px-3 py-2 rounded-t-md font-semibold text-sm flex items-center gap-2 ${
        selected ? 'bg-green-600' : 'bg-blue-600'
      }`}>
        <span>📊</span>
        <span>{data.label}</span>
        {selected && <span className="ml-auto text-xs">✓ Selected</span>}
      </div>
      
      {/* Table Columns */}
      <div className="p-2 max-h-[300px] overflow-y-auto">
        {data.columns?.map((column: Column, idx: number) => {
          const isForeignKey = foreignKeyColumns.has(column.name)
          const isReferenced = referencedColumns.has(column.name)
          
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs border-b border-slate-100 last:border-b-0 hover:bg-slate-50 relative ${
                isForeignKey ? 'bg-blue-50' : isReferenced ? 'bg-green-50' : ''
              }`}
            >
              {/* Handle for outgoing FK relationships (left side) */}
              {isForeignKey && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`col-${column.name}-source`}
                  style={{
                    background: '#3b82f6',
                    width: 8,
                    height: 8,
                    right: -4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
              
              {/* Handle for incoming FK references (right side) */}
              {isReferenced && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`col-${column.name}-target`}
                  style={{
                    background: '#10b981',
                    width: 8,
                    height: 8,
                    left: -4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
              
              {column.primary_key && <span className="text-yellow-600">🔑</span>}
              {isForeignKey && <span className="text-blue-600">🔗</span>}
              <span className={`font-mono flex-1 ${column.primary_key ? 'font-bold' : ''}`}>
                {column.name}
              </span>
              <span className="text-slate-500 text-[10px]">{column.type}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const nodeTypes = {
  tableNode: TableNode,
}

export function SchemaVisualizer({ schema }: SchemaVisualizerProps) {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isInfoMinimized, setIsInfoMinimized] = useState(false)
  
  // Calculate layout positions for tables
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    // Build a map of which columns are referenced by other tables
    const referencedByMap: Record<string, Array<{ column: string; fromTable: string }>> = {}
    
    schema.forEach((table) => {
      if (table.foreign_keys) {
        table.foreign_keys.forEach((fk) => {
          if (!referencedByMap[fk.referred_table]) {
            referencedByMap[fk.referred_table] = []
          }
          fk.referred_columns.forEach((col) => {
            referencedByMap[fk.referred_table].push({
              column: col,
              fromTable: table.name,
            })
          })
        })
      }
    })
    
    // Create a grid layout for tables
    const columns = Math.ceil(Math.sqrt(schema.length))
    const horizontalSpacing = 320
    const verticalSpacing = 280
    
    schema.forEach((table, index) => {
      const row = Math.floor(index / columns)
      const col = index % columns
      
      nodes.push({
        id: table.name,
        type: 'tableNode',
        position: {
          x: col * horizontalSpacing + 50,
          y: row * verticalSpacing + 50,
        },
        data: {
          label: table.name,
          columns: table.columns,
          foreignKeys: table.foreign_keys || [],
          referencedBy: referencedByMap[table.name] || [],
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })
      
      // Create edges for foreign key relationships
      if (table.foreign_keys) {
        table.foreign_keys.forEach((fk) => {
          // Create an edge for each constrained column pair
          fk.constrained_columns.forEach((sourceCol, colIdx) => {
            const targetCol = fk.referred_columns[colIdx] || fk.referred_columns[0]
            const edgeId = `${table.name}-${sourceCol}-${fk.referred_table}-${targetCol}`
            
            const isSelfReference = table.name === fk.referred_table
            
            edges.push({
              id: edgeId,
              source: table.name,
              sourceHandle: `col-${sourceCol}-source`,
              target: fk.referred_table,
              targetHandle: `col-${targetCol}-target`,
              type: 'smoothstep',
              animated: true,
              label: `${sourceCol} → ${targetCol}`,
              labelStyle: { 
                fontSize: isSelfReference ? 11 : 10, // Larger font for better readability
                fill: '#1e40af',
                fontWeight: 600,
              },
              labelBgStyle: { 
                fill: '#ffffff', 
                fillOpacity: 0.95,
              },
              labelBgPadding: [6, 8] as [number, number], // More padding for visibility
              labelBgBorderRadius: 4,
              style: { 
                stroke: '#3b82f6', 
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6',
              },
            })
          })
        })
      }
    })
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [schema])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes styling based on selected node
  const styledNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
    }))
  }, [nodes, selectedNodeId])

  // Update edges styling based on selected node
  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const isSelfReference = edge.source === edge.target
      const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId
      
      // Self-referencing edges always get orange styling
      if (isSelfReference) {
        const isSelected = isConnected && selectedNodeId
        return {
          ...edge,
          animated: true,
          style: {
            stroke: '#f97316', // orange-500
            strokeWidth: isSelected ? 4 : 2.5,
            opacity: !selectedNodeId || isSelected ? 1 : 0.2,
          },
          labelStyle: {
            ...edge.labelStyle,
            fill: '#ea580c', // orange-600
            fontSize: 11, // Larger for self-references
            fontWeight: isSelected ? 700 : 600,
            opacity: !selectedNodeId || isSelected ? 1 : 0.2,
          },
          labelBgStyle: {
            ...edge.labelBgStyle,
            fill: '#fff7ed', // orange-50
            fillOpacity: 0.95,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f97316',
          },
        }
      }
      
      // Regular edges - highlight in green when connected to selected node
      if (selectedNodeId) {
        if (isConnected) {
          return {
            ...edge,
            animated: true,
            style: {
              stroke: '#22c55e', // green-500
              strokeWidth: 4,
            },
            labelStyle: {
              ...edge.labelStyle,
              fill: '#16a34a', // green-600
              fontSize: 11, // Larger when highlighted
              fontWeight: 700,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#22c55e',
            },
          }
        } else {
          return {
            ...edge,
            animated: false,
            style: {
              ...edge.style,
              opacity: 0.2,
            },
            labelStyle: {
              ...edge.labelStyle,
              opacity: 0.2,
            },
          }
        }
      }
      
      // Default edge appearance
      return edge
    })
  }, [edges, selectedNodeId])

  // Update nodes when schema changes
  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // Handle node click - toggle selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId((prevId) => (prevId === node.id ? null : node.id))
  }, [])

  // Handle pane click - deselect node
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Auto-layout function using dagre
  const onNormalizeLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    // Configure the graph layout
    dagreGraph.setGraph({ 
      rankdir: 'LR', // Left to right layout
      nodesep: 100,  // Horizontal spacing between nodes
      ranksep: 150,  // Vertical spacing between ranks
      edgesep: 50,   // Spacing between edges
      marginx: 50,
      marginy: 50,
    })

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { 
        width: 260,  // Approximate node width
        height: 200, // Approximate node height (will vary by number of columns)
      })
    })

    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })

    // Calculate layout
    dagre.layout(dagreGraph)

    // Update node positions
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 130, // Center the node (half of width)
          y: nodeWithPosition.y - 100, // Center the node (half of height)
        },
      }
    })

    setNodes(layoutedNodes)
  }, [nodes, edges, setNodes])

  if (schema.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg">No schema available</p>
          <p className="text-sm mt-2">Select a connector to view database schema</p>
        </div>
      </div>
    )
  }

  const hasRelationships = schema.some(table => 
    table.foreign_keys && table.foreign_keys.length > 0
  )

  // Render the ReactFlow diagram
  const renderDiagram = (inFullScreen = false) => (
    <>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#f8fafc',
          }}
        />
      </ReactFlow>
      
      {/* Info overlay - top-left corner in both normal and full-screen modes */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md border text-xs max-w-[280px] z-10">
        {/* Header with minimize toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-slate-700">Schema Overview</div>
          <button
            onClick={() => setIsInfoMinimized(!isInfoMinimized)}
            className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded"
            title={isInfoMinimized ? "Expand" : "Collapse"}
          >
            {isInfoMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        
        {/* Stats line - always visible */}
        <div className="text-slate-600 mb-3">
          {schema.length} table{schema.length !== 1 ? 's' : ''}
          {hasRelationships && (
            <span className="ml-2">• {edges.length} relationship{edges.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        {/* Expandable content */}
        {!isInfoMinimized && (
          <>
            <div className="space-y-1.5 mb-3 pt-2 border-t">
              <div className="font-semibold text-slate-700">Legend:</div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">🔑</span>
                <span className="text-slate-600">Primary Key</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🔗</span>
                <span className="text-slate-600">Foreign Key</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-slate-600">FK Column</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-slate-600">Referenced Column</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-500 rounded"></div>
                <span className="text-slate-600">Self-reference</span>
              </div>
            </div>
            
            <div className="text-slate-500 italic pt-2 border-t space-y-1">
              <div>💡 Drag to pan, scroll to zoom</div>
              <div>🖱️ Click table to highlight relations</div>
            </div>
          </>
        )}
        
        {/* Action buttons */}
        <div className={`${isInfoMinimized ? '' : 'pt-3 border-t mt-3'}`}>
          <Button
            onClick={onNormalizeLayout}
            size="sm"
            variant="default"
            className={isInfoMinimized ? 'px-2' : 'w-full'}
            title="Normalize Layout"
          >
            <Network className="w-3 h-3" />
            {!isInfoMinimized && <span className="ml-2">Normalize Layout</span>}
          </Button>
        </div>
      </div>
      
      {/* Full Screen Toggle Button - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => inFullScreen ? setIsFullScreenOpen(false) : setIsFullScreenOpen(true)}
          size="sm"
          variant="outline"
          className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
          title={inFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {inFullScreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </>
  )

  return (
    <>
      <div className="h-full w-full bg-slate-50 rounded-lg border">
        <div className="h-full relative">
          {renderDiagram(false)}
        </div>
      </div>

      {/* Full Screen Preview */}
      <FullScreenPreview
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title="Database Schema Diagram"
      >
        <div className="w-full h-full bg-slate-50">
          {renderDiagram(true)}
        </div>
      </FullScreenPreview>
    </>
  )
}


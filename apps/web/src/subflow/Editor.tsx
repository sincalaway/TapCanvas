import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, ConnectionLineType, addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import TaskNode from '../canvas/nodes/TaskNode'
import { useRFStore } from '../canvas/store'

type Props = { nodeId: string; onClose: () => void }

export default function SubflowEditor({ nodeId, onClose }: Props) {
  const node = useRFStore(s => s.nodes.find(n => n.id === nodeId))
  const updateNodeData = useRFStore(s => s.updateNodeData)
  const [open, setOpen] = useState(true)
  const [nodes, setNodes] = useState<Node[]>(() => (node?.data as any)?.subflow?.nodes || [])
  const [edges, setEdges] = useState<Edge[]>(() => (node?.data as any)?.subflow?.edges || [])

  const onNodesChange = useCallback((changes: any[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [])
  const onEdgesChange = useCallback((changes: any[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])
  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, type: 'smoothstep', animated: true }, eds)), [])

  const save = () => {
    updateNodeData(nodeId, { subflow: { nodes, edges } })
    onClose()
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '88%', height: '88%', background: 'white', color: 'inherit', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}>
        <div style={{ padding: 10, borderBottom: '1px solid rgba(127,127,127,.2)', display: 'flex', justifyContent: 'space-between' }}>
          <div>编辑子工作流 - {node?.data?.label || nodeId}</div>
          <div>
            <button onClick={save}>保存</button>
            <button onClick={onClose} style={{ marginLeft: 8 }}>关闭</button>
          </div>
        </div>
        <div style={{ height: 'calc(100% - 44px)' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={{ taskNode: TaskNode }}
              fitView
              connectionLineType={ConnectionLineType.SmoothStep}
            >
              <MiniMap />
              <Controls />
              <Background gap={16} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  )
}


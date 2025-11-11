import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, ConnectionLineType, addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import TaskNode from '../canvas/nodes/TaskNode'
import { getFlow, saveFlow, type FlowIO, validateNoCycle } from './registry'

type Props = { flowId: string; onClose: () => void }

export default function LibraryEditor({ flowId, onClose }: Props) {
  const rec = getFlow(flowId)
  const [nodes, setNodes] = useState<Node[]>(rec?.nodes || [])
  const [edges, setEdges] = useState<Edge[]>(rec?.edges || [])
  const [name, setName] = useState(rec?.name || '')
  const [io, setIo] = useState<FlowIO>(rec?.io || { inputs: [], outputs: [] })

  useEffect(() => {
    const r = getFlow(flowId)
    if (r) {
      setNodes(r.nodes); setEdges(r.edges); setName(r.name); setIo(r.io || { inputs: [], outputs: [] })
    }
  }, [flowId])

  const onNodesChange = useCallback((changes: any[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [])
  const onEdgesChange = useCallback((changes: any[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])
  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, type: 'smoothstep', animated: true }, eds)), [])

  const saveAll = () => {
    const v = validateNoCycle(flowId)
    if (!v.ok) { alert(v.reason || '存在引用环，请先移除环再保存'); return }
    saveFlow({ id: flowId, name, nodes, edges, io })
    onClose()
  }

  const addPort = (dir: 'inputs'|'outputs') => {
    const label = prompt('端口名称：')?.trim(); if (!label) return
    const type = prompt('端口类型（image/audio/subtitle/video/any）：', 'any')?.trim() as any
    setIo((prev) => ({ ...prev, [dir]: [...prev[dir], { id: `${dir}-${Date.now().toString(36)}`, label, type }] }))
  }
  const removePort = (dir: 'inputs'|'outputs', id: string) => setIo((prev)=>({ ...prev, [dir]: prev[dir].filter(p=>p.id !== id) }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '92%', height: '92%', background: 'white', color: 'inherit', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.35)', display: 'grid', gridTemplateColumns: '1fr 320px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 10, borderBottom: '1px solid rgba(127,127,127,.2)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <input value={name} onChange={(e)=>setName(e.target.value)} style={{ fontWeight: 600, border: '1px solid rgba(127,127,127,.35)', borderRadius: 6, padding: '4px 8px' }} />
            </div>
            <div>
              <button onClick={saveAll}>保存</button>
              <button onClick={onClose} style={{ marginLeft: 8 }}>关闭</button>
            </div>
          </div>
          <div style={{ height: '100%' }}>
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
        <div style={{ borderLeft: '1px solid rgba(127,127,127,.2)', padding: 12, overflow: 'auto' }}>
          <h3 style={{ margin: '8px 0 8px', fontSize: 14 }}>IO 端口</h3>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Inputs</div>
          {io.inputs.length === 0 && <div style={{ fontSize: 12, opacity: .6 }}>无</div>}
          {io.inputs.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>{p.label} <span style={{ opacity: .6 }}>({p.type})</span></span>
              <button onClick={()=>removePort('inputs', p.id)}>删除</button>
            </div>
          ))}
          <button onClick={()=>addPort('inputs')} style={{ marginBottom: 12 }}>+ 添加输入</button>

          <div style={{ marginTop: 8, marginBottom: 8, fontWeight: 600 }}>Outputs</div>
          {io.outputs.length === 0 && <div style={{ fontSize: 12, opacity: .6 }}>无</div>}
          {io.outputs.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12 }}>{p.label} <span style={{ opacity: .6 }}>({p.type})</span></span>
              <button onClick={()=>removePort('outputs', p.id)}>删除</button>
            </div>
          ))}
          <button onClick={()=>addPort('outputs')}>+ 添加输出</button>
        </div>
      </div>
    </div>
  )
}

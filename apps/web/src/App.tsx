import React, { useState } from 'react'
import Canvas from './canvas/Canvas'
import { useRFStore } from './canvas/store'
import './styles.css'
import KeyboardShortcuts from './KeyboardShortcuts'
import NodeInspector from './inspector/NodeInspector'
import { applyTemplate, captureCurrentSelection, deleteTemplate, listTemplateNames, saveTemplate, renameTemplate } from './templates'
import { ToastHost, toast } from './ui/toast'
import { useUIStore } from './ui/uiStore'
import SubflowEditor from './subflow/Editor'
import LibraryEditor from './flows/LibraryEditor'
import { listFlows, saveFlow, deleteFlow as deleteLibraryFlow, renameFlow, getFlow, scanCycles } from './flows/registry'

export default function App(): JSX.Element {
  const addNode = useRFStore((s) => s.addNode)
  const reset = useRFStore((s) => s.reset)
  const load = useRFStore((s) => s.load)
  const state = useRFStore((s) => ({ nodes: s.nodes, edges: s.edges }))
  const runSelected = useRFStore((s) => s.runSelected)
  const runAll = useRFStore((s) => s.runAll)
  const runDag = useRFStore((s) => s.runDag)
  const [concurrency, setConcurrency] = useState(2)
  const cancelAll = useRFStore((s) => s.cancelAll)
  const retryFailed = useRFStore((s) => s.retryFailed)
  const subflowNodeId = useUIStore(s => s.subflowNodeId)
  const closeSubflow = useUIStore(s => s.closeSubflow)
  const libraryFlowId = useUIStore(s => s.libraryFlowId)
  const closeLibraryFlow = useUIStore(s => s.closeLibraryFlow)
  const [refresh, setRefresh] = useState(0)

  return (
    <div className="app-shell" style={{ fontFamily: 'system-ui, sans-serif', gridTemplateColumns: '260px 1fr 280px' }}>
      <aside className="sidebar">
        <h2>TapCanvas</h2>
        <div className="toolbar">
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'taskNode', label: '文本转图像', kind: 'textToImage' }))}
            onClick={() => addNode('taskNode', '文本转图像', { kind: 'textToImage' })}
          >+ 文本转图像</button>
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'taskNode', label: '视频合成', kind: 'composeVideo' }))}
            onClick={() => addNode('taskNode', '视频合成', { kind: 'composeVideo' })}
          >+ 视频合成</button>
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'taskNode', label: 'TTS 语音', kind: 'tts' }))}
            onClick={() => addNode('taskNode', 'TTS 语音', { kind: 'tts' })}
          >+ TTS 语音</button>
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'taskNode', label: '字幕对齐', kind: 'subtitleAlign' }))}
            onClick={() => addNode('taskNode', '字幕对齐', { kind: 'subtitleAlign' })}
          >+ 字幕对齐</button>
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'taskNode', label: '子工作流', kind: 'subflow' }))}
            onClick={() => addNode('taskNode', '子工作流', { kind: 'subflow' })}
          >+ 子工作流</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => reset()}>清空画布</button>
        </div>
        <p style={{ fontSize: 12, opacity: .7, marginTop: 12 }}>
          提示：拖拽节点、连线；自动保存至本地。
        </p>
      </aside>
      <main>
        <div className="header">
          <div>画布</div>
          <div>
            <button onClick={() => window.location.reload()}>重置视图</button>
            <button onClick={() => import('./canvas/store').then(m => m.persistToLocalStorage())}>保存</button>
            <button onClick={() => runSelected()} style={{ marginLeft: 8 }}>运行选中</button>
            <button onClick={() => runAll()} style={{ marginLeft: 6 }}>运行全部</button>
            <span style={{ marginLeft: 8, fontSize: 12 }}>并发</span>
            <input
              type="number"
              min={1}
              max={8}
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              style={{ width: 56, marginLeft: 4, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(127,127,127,.3)' }}
            />
            <button onClick={() => runDag(concurrency)} style={{ marginLeft: 6 }}>运行流程(DAG)</button>
            <button onClick={() => cancelAll()} style={{ marginLeft: 6 }}>全部停止</button>
            <button onClick={() => retryFailed()} style={{ marginLeft: 6 }}>重试失败</button>
            <span style={{ fontSize: 12, opacity: .7, marginLeft: 8 }}>React Flow + TypeScript</span>
          </div>
        </div>
        <div style={{ height: 'calc(100vh - 49px)' }}>
          <Canvas />
        </div>
      </main>
      <aside className="sidebar">
        <NodeInspector />
        <div style={{ marginTop: 16 }}>
          <h2 style={{ margin: '8px 0 12px', fontSize: 16 }}>导入/导出</h2>
          <button onClick={() => {
            const data = JSON.stringify(state, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'tapcanvas-flow.json'
            a.click()
            URL.revokeObjectURL(url)
          }}>导出 JSON</button>
          <button onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'application/json'
            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return
              const text = await file.text()
              try {
                const json = JSON.parse(text)
                load(json)
              } catch {
                alert('导入失败：JSON 格式不正确')
              }
            }
            input.click()
          }} style={{ marginTop: 8 }}>导入 JSON</button>
        </div>
        <div style={{ marginTop: 16 }}>
          <h2 style={{ margin: '8px 0 12px', fontSize: 16 }}>模板</h2>
          <button onClick={() => {
            const data = captureCurrentSelection()
            if (!data) { alert('请先选择要保存为模板的节点'); return }
            const name = prompt('模板名称：')?.trim()
            if (!name) return
            saveTemplate(name, data)
            // force re-render by triggering state update
            setConcurrency(c => c)
          }}>保存所选为模板</button>

          <div style={{ marginTop: 8 }}>
            {listTemplateNames().length === 0 && (
              <div style={{ fontSize: 12, opacity: .6 }}>暂无模板</div>
            )}
            {listTemplateNames().map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 12, opacity: .85 }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/tap-template', n)
                  }}
                  title="拖拽到画布以插入"
                >{n}</span>
                <span>
                  <button onClick={() => applyTemplate(n)}>插入</button>
                  <button onClick={() => {
                    const next = prompt('重命名为：', n)?.trim()
                    if (!next || next === n) return
                    renameTemplate(n, next)
                    setConcurrency(c => c)
                  }} style={{ marginLeft: 6 }}>重命名</button>
                  <button onClick={() => { deleteTemplate(n); setConcurrency(c => c) }} style={{ marginLeft: 6 }}>删除</button>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h2 style={{ margin: '8px 0 12px', fontSize: 16 }}>工作流库</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={() => {
              const name = prompt('将当前画布保存为工作流，命名：')?.trim()
              if (!name) return
              saveFlow({ name, nodes: state.nodes, edges: state.edges })
              toast('已保存到工作流库', 'success')
              setRefresh(r=>r+1)
            }}>保存当前为 Flow</button>
            <button onClick={() => {
              const bad = scanCycles()
              if (bad.length) toast(`发现引用环：${bad.join(', ')}`, 'error')
              else toast('未发现引用环', 'success')
            }}>检查引用环</button>
          </div>
          <div>
            {listFlows().length === 0 && <div style={{ fontSize: 12, opacity: .6 }}>暂无工作流</div>}
            {listFlows().map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                <span
                  style={{ fontSize: 12, opacity: .85 }}
                  draggable
                  title="拖拽到画布以插入引用子工作流"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/tapflow', JSON.stringify({ id: f.id, name: f.name }))
                  }}
                >{f.name}</span>
                <span>
                  <button onClick={() => {
                    // 插入引用的子工作流节点
                    addNode('taskNode', f.name, { kind: 'subflow', subflowRef: f.id })
                  }}>引用为子工作流</button>
                  <button onClick={() => useUIStore.getState().openLibraryFlow(f.id)} style={{ marginLeft: 6 }}>打开</button>
                  <button onClick={() => {
                    const next = prompt('重命名：', f.name)?.trim()
                    if (!next || next === f.name) return
                    renameFlow(f.id, next); setRefresh(r=>r+1)
                  }} style={{ marginLeft: 6 }}>重命名</button>
                  <button onClick={() => { if(confirm('确认删除该 Flow?')) { deleteLibraryFlow(f.id); setRefresh(r=>r+1) } }} style={{ marginLeft: 6 }}>删除</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <KeyboardShortcuts />
      <ToastHost />
      {subflowNodeId && (
        <SubflowEditor nodeId={subflowNodeId} onClose={closeSubflow} />
      )}
      {libraryFlowId && (
        <LibraryEditor flowId={libraryFlowId} onClose={closeLibraryFlow} />
      )}
    </div>
  )
}

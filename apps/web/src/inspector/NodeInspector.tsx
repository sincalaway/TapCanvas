import React, { useEffect, useMemo } from 'react'
import { useRFStore } from '../canvas/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  textToImageSchema,
  composeVideoSchema,
  ttsSchema,
  subtitleAlignSchema,
  defaultsFor
} from './forms'

export default function NodeInspector(): JSX.Element {
  const nodes = useRFStore((s) => s.nodes)
  const updateNodeLabel = useRFStore((s) => s.updateNodeLabel)
  const cancelNode = useRFStore((s) => s.cancelNode)
  const runSelected = useRFStore((s) => s.runSelected)

  const selected = useMemo(() => nodes.find((n) => n.selected), [nodes])
  const logs = (selected?.data as any)?.logs as string[] | undefined
  const result = (selected?.data as any)?.lastResult as any

  const kind = (selected?.data as any)?.kind as string | undefined
  const subflowRef = (selected?.data as any)?.subflowRef as string | undefined
  const subflowIO = (selected?.data as any)?.io as any
  const bindings = (selected?.data as any)?.ioBindings as { inputs?: Record<string,string>; outputs?: Record<string,string> } || { inputs: {}, outputs: {} }

  const form = useForm<any>({
    resolver: zodResolver(
      kind === 'textToImage' ? textToImageSchema :
      kind === 'composeVideo' ? composeVideoSchema :
      kind === 'tts' ? ttsSchema :
      kind === 'subtitleAlign' ? subtitleAlignSchema :
      textToImageSchema
    ),
    defaultValues: defaultsFor(kind)
  })

  useEffect(() => {
    if (selected) {
      const data = { ...defaultsFor(kind), ...(selected.data || {}) }
      // exclude non-form fields
      const { label, kind: _k, ...rest } = data as any
      form.reset(rest)
    }
  }, [selected?.id, kind])

  if (!selected) {
    return (
      <div>
        <h2 style={{ margin: '8px 0 12px', fontSize: 16 }}>属性</h2>
        <div style={{ fontSize: 12, opacity: .7 }}>选中一个节点以编辑属性。</div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ margin: '8px 0 12px', fontSize: 16 }}>属性</h2>
      <div style={{ marginBottom: 8, fontSize: 12, opacity: .7 }}>ID: {selected.id}</div>
      <div style={{ marginBottom: 6, fontSize: 12, opacity: .7 }}>状态：{(selected.data as any)?.status ?? 'idle'}</div>
      <div style={{ display: 'flex', gap: 8, margin: '4px 0 10px' }}>
        <button onClick={() => runSelected()}>运行</button>
        <button onClick={() => cancelNode(selected.id)}>停止</button>
        <button onClick={() => useRFStore.getState().updateNodeData(selected.id, { logs: [] })}>清空日志</button>
      </div>

      {kind === 'subflow' && (
        <div style={{ padding: '10px 10px', border: '1px dashed rgba(127,127,127,.35)', borderRadius: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 12, opacity: .8, marginBottom: 6 }}>子工作流模式：{subflowRef ? `引用 (${subflowRef})` : '嵌入'}</div>
          {!subflowRef && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => useUIStore.getState().openSubflow(selected.id)}>打开子工作流</button>
              <button onClick={() => {
                const flows = require('../flows/registry') as any
                const list = flows.listFlows?.() || []
                if (!list.length) { alert('库中暂无工作流'); return }
                const pick = prompt('输入要引用的 Flow 名称：\n' + list.map((f:any)=>`- ${f.name} (${f.id})`).join('\n'))
                const match = list.find((f:any)=> f.name === pick || f.id === pick)
                if (match) {
                  const rec = flows.getFlow?.(match.id)
                  useRFStore.getState().updateNodeData(selected.id, { subflowRef: match.id, label: match.name, subflow: undefined, io: rec?.io })
                }
              }}>转换为引用</button>
            </div>
          )}
          {subflowRef && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => {
                const flows = require('../flows/registry') as any
                const rec = flows.getFlow?.(subflowRef)
                if (!rec) { alert('引用的 Flow 不存在'); return }
                useRFStore.getState().updateNodeData(selected.id, { subflow: { nodes: rec.nodes, edges: rec.edges }, subflowRef: undefined })
              }}>解除引用并嵌入副本</button>
              <button onClick={() => {
                const flows = require('../flows/registry') as any
                const rec = flows.getFlow?.(subflowRef)
                if (!rec) { alert('Flow 不存在'); return }
                useRFStore.getState().updateNodeData(selected.id, { io: rec.io })
              }}>同步 IO</button>
            </div>
          )}
        </div>
      )}
      <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>标题</label>
      <input
        value={(selected.data as any)?.label ?? ''}
        onChange={(e) => updateNodeLabel(selected.id, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }}
      />

      {kind === 'textToImage' && (
        <form onSubmit={form.handleSubmit((values) => useRFStore.getState().updateNodeData(selected.id, values))} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>提示词</label>
          <textarea {...form.register('prompt')} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
          <div style={{ color: 'tomato', fontSize: 12 }}>{form.formState.errors.prompt?.message as any}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>Steps</label>
              <input type="number" {...form.register('steps', { valueAsNumber: true })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>Seed</label>
              <input type="number" {...form.register('seed', { valueAsNumber: true })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
            </div>
          </div>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, margin: '8px 0 4px' }}>比例</label>
          <select {...form.register('aspect')} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }}>
            <option value="16:9">16:9</option>
            <option value="1:1">1:1</option>
            <option value="9:16">9:16</option>
          </select>
          <button type="submit" style={{ marginTop: 10 }}>应用</button>
        </form>
      )}

      {kind === 'composeVideo' && (
        <form onSubmit={form.handleSubmit((values) => useRFStore.getState().updateNodeData(selected.id, values))} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>分镜/脚本</label>
          <textarea {...form.register('storyboard')} rows={4} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
          <div style={{ color: 'tomato', fontSize: 12 }}>{form.formState.errors.storyboard?.message as any}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>Duration(s)</label>
              <input type="number" {...form.register('duration', { valueAsNumber: true })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>FPS</label>
              <input type="number" {...form.register('fps', { valueAsNumber: true })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 10 }}>应用</button>
        </form>
      )}

      {kind === 'tts' && (
        <form onSubmit={form.handleSubmit((values) => useRFStore.getState().updateNodeData(selected.id, values))} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>文本</label>
          <textarea {...form.register('text')} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
          <div style={{ color: 'tomato', fontSize: 12 }}>{form.formState.errors.text?.message as any}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>声音</label>
              <select {...form.register('voice')} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }}>
                <option value="female">female</option>
                <option value="male">male</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>速度</label>
              <input type="number" step="0.1" {...form.register('speed', { valueAsNumber: true })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
            </div>
          </div>
          <button type="submit" style={{ marginTop: 10 }}>应用</button>
        </form>
      )}

      {kind === 'subtitleAlign' && (
        <form onSubmit={form.handleSubmit((values) => useRFStore.getState().updateNodeData(selected.id, values))} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, marginBottom: 4 }}>音频 URL</label>
          <input {...form.register('audioUrl')} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
          <div style={{ color: 'tomato', fontSize: 12 }}>{form.formState.errors.audioUrl?.message as any}</div>
          <label style={{ display: 'block', fontSize: 12, opacity: .8, margin: '8px 0 4px' }}>字幕文本</label>
          <textarea {...form.register('transcript')} rows={4} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.3)' }} />
          <div style={{ color: 'tomato', fontSize: 12 }}>{form.formState.errors.transcript?.message as any}</div>
          <button type="submit" style={{ marginTop: 10 }}>应用</button>
        </form>
      )}

      {kind === 'subflow' && subflowIO && (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: '8px 0 8px', fontSize: 14 }}>IO 映射</h3>
          <div style={{ fontSize: 12, opacity: .7, marginBottom: 6 }}>配置父级变量名/键，与子工作流 IO 对应（占位实现）。</div>
          <div style={{ fontWeight: 600, margin: '6px 0' }}>Inputs</div>
          {(subflowIO.inputs || []).length === 0 && <div style={{ fontSize: 12, opacity: .6 }}>无</div>}
          {(subflowIO.inputs || []).map((p: any) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 120, fontSize: 12 }}>{p.label} <span style={{ opacity: .6 }}>({p.type})</span></span>
              <input
                placeholder="父级变量名"
                value={bindings.inputs?.[p.id] || ''}
                onChange={(e) => useRFStore.getState().updateNodeData(selected.id, { ioBindings: { inputs: { ...bindings.inputs, [p.id]: e.target.value }, outputs: bindings.outputs } })}
                style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(127,127,127,.35)' }}
              />
            </div>
          ))}
          <div style={{ fontWeight: 600, margin: '6px 0' }}>Outputs</div>
          {(subflowIO.outputs || []).length === 0 && <div style={{ fontSize: 12, opacity: .6 }}>无</div>}
          {(subflowIO.outputs || []).map((p: any) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 120, fontSize: 12 }}>{p.label} <span style={{ opacity: .6 }}>({p.type})</span></span>
              <input
                placeholder="父级输出键"
                value={bindings.outputs?.[p.id] || ''}
                onChange={(e) => useRFStore.getState().updateNodeData(selected.id, { ioBindings: { inputs: bindings.inputs, outputs: { ...bindings.outputs, [p.id]: e.target.value } } })}
                style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(127,127,127,.35)' }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0 8px', fontSize: 14 }}>运行日志</h3>
        <div style={{
          maxHeight: 160,
          overflow: 'auto',
          border: '1px solid rgba(127,127,127,.25)',
          borderRadius: 8,
          padding: '8px 10px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12
        }}>
          {(logs && logs.length) ? logs.map((l, i) => (<div key={i}>{l}</div>)) : <div style={{ opacity: .6 }}>暂无日志</div>}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: '8px 0 8px', fontSize: 14 }}>预览</h3>
        {result?.preview?.type === 'image' && result.preview.src && (
          <img src={result.preview.src} alt={String((selected.data as any)?.label || '')} style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(127,127,127,.25)' }} />
        )}
        {result?.preview?.type === 'audio' && (
          <div style={{ fontSize: 12, opacity: .7 }}>（音频占位，暂未生成音频数据）</div>
        )}
        {!result?.preview && (
          <div style={{ fontSize: 12, opacity: .6 }}>暂无预览</div>
        )}
      </div>
    </div>
  )
}

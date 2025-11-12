import React from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position, NodeToolbar } from 'reactflow'
import { useRFStore } from '../store'
import { useUIStore } from '../../ui/uiStore'
import { ActionIcon, Group, Paper, Textarea, Select, NumberInput, Button, Text } from '@mantine/core'
import { IconMaximize, IconDownload, IconArrowsDiagonal2, IconBrush, IconPhotoUp, IconDots, IconAdjustments } from '@tabler/icons-react'

type Data = {
  label: string
  kind?: string
  status?: 'idle' | 'queued' | 'running' | 'success' | 'error' | 'canceled'
  progress?: number
}

export default function TaskNode({ id, data, selected }: NodeProps<Data>): JSX.Element {
  const status = data?.status ?? 'idle'
  const color =
    status === 'success' ? '#16a34a' :
    status === 'error' ? '#ef4444' :
    status === 'canceled' ? '#475569' :
    status === 'running' ? '#8b5cf6' :
    status === 'queued' ? '#f59e0b' : 'rgba(127,127,127,.6)'

  const kind = data?.kind
  const targets: { id: string; type: string; pos: Position }[] = []
  const sources: { id: string; type: string; pos: Position }[] = []

  if (kind === 'composeVideo') {
    targets.push({ id: 'in-image', type: 'image', pos: Position.Left })
    targets.push({ id: 'in-audio', type: 'audio', pos: Position.Left })
    targets.push({ id: 'in-subtitle', type: 'subtitle', pos: Position.Left })
    sources.push({ id: 'out-video', type: 'video', pos: Position.Right })
  } else if (kind === 'subflow') {
    const io = (data as any)?.io as { inputs?: { id: string; type: string; label?: string }[]; outputs?: { id: string; type: string; label?: string }[] } | undefined
    if (io?.inputs?.length) io.inputs.forEach((p, idx) => targets.push({ id: `in-${p.type}`, type: p.type, pos: Position.Left }))
    if (io?.outputs?.length) io.outputs.forEach((p, idx) => sources.push({ id: `out-${p.type}`, type: p.type, pos: Position.Right }))
  } else if (kind === 'textToImage') {
    sources.push({ id: 'out-image', type: 'image', pos: Position.Right })
  } else if (kind === 'tts') {
    sources.push({ id: 'out-audio', type: 'audio', pos: Position.Right })
  } else if (kind === 'subtitleAlign') {
    sources.push({ id: 'out-subtitle', type: 'subtitle', pos: Position.Right })
  } else {
    // generic fallback
    targets.push({ id: 'in-any', type: 'any', pos: Position.Left })
    sources.push({ id: 'out-any', type: 'any', pos: Position.Right })
  }

  const [editing, setEditing] = React.useState(false)
  const updateNodeLabel = useRFStore(s => s.updateNodeLabel)
  const openSubflow = useUIStore(s => s.openSubflow)
  const openParamFor = useUIStore(s => s.openParamFor)
  const runSelected = useRFStore(s => s.runSelected)
  const updateNodeData = useRFStore(s => s.updateNodeData)
  const [prompt, setPrompt] = React.useState<string>((data as any)?.prompt || '')
  const [aspect, setAspect] = React.useState<string>((data as any)?.aspect || '16:9')
  const [scale, setScale] = React.useState<number>((data as any)?.scale || 1)

  return (
    <div style={{
      border: '1px solid rgba(127,127,127,.35)',
      borderRadius: 12,
      padding: '10px 12px',
      background: 'rgba(127,127,127,.08)'
    }}>
      {/* Top floating toolbar anchored to node */}
      <NodeToolbar isVisible={!!selected} position={Position.Top} align="center">
        <Paper withBorder shadow="sm" radius="xl" className="glass" p={4}>
          <Group gap={6}>
            <ActionIcon variant="subtle" title="放大预览"><IconMaximize size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="下载"><IconDownload size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="扩图/重绘"><IconArrowsDiagonal2 size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="局部重绘"><IconBrush size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="高清增强"><IconPhotoUp size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="参数" onClick={()=>openParamFor(id)}><IconAdjustments size={16} /></ActionIcon>
            <ActionIcon variant="subtle" title="更多"><IconDots size={16} /></ActionIcon>
          </Group>
        </Paper>
      </NodeToolbar>
      {targets.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type="target"
          position={h.pos}
          style={{ left: h.pos===Position.Left? -6: undefined, right: h.pos===Position.Right? -6: undefined }}
          data-handle-type={h.type}
          title={`输入: ${h.type}`}
        />
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {!editing ? (
          <strong
            onDoubleClick={() => {
              if (kind === 'subflow') openSubflow(id)
              else setEditing(true)
            }}
            title="双击重命名"
            style={{ cursor: 'text' }}
          >{data?.label ?? 'Task'}</strong>
        ) : (
          <input
            autoFocus
            defaultValue={data?.label ?? ''}
            onBlur={(e) => { updateNodeLabel(id, e.currentTarget.value); setEditing(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { updateNodeLabel(id, (e.target as HTMLInputElement).value); setEditing(false) }
              if (e.key === 'Escape') { setEditing(false) }
            }}
            style={{ fontWeight: 700, fontSize: '1em', background: 'transparent', border: '1px solid rgba(127,127,127,.35)', borderRadius: 6, padding: '2px 6px' }}
          />
        )}
        <span style={{
          fontSize: 11,
          color,
          border: `1px solid ${color}`,
          padding: '1px 6px',
          borderRadius: 999,
          background: 'transparent'
        }}>{status}</span>
      </div>
      <div style={{ fontSize: 12, opacity: .8 }}>{data?.kind ?? '节点'}</div>
      {sources.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sources.map(s => (
            <span key={s.id} style={{ fontSize: 10, opacity: .7, border: '1px solid rgba(127,127,127,.35)', borderRadius: 999, padding: '1px 6px' }}>{s.type}</span>
          ))}
        </div>
      )}
      {status === 'running' && (
        <div style={{ marginTop: 6, height: 6, background: 'rgba(127,127,127,.25)', borderRadius: 4 }}>
          <div style={{ width: `${Math.min(100, Math.max(0, data?.progress ?? 0))}%`, height: '100%', background: color, borderRadius: 4 }} />
        </div>
      )}
      {sources.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type="source"
          position={h.pos}
          style={{ right: h.pos===Position.Right? -6: undefined, left: h.pos===Position.Left? -6: undefined }}
          data-handle-type={h.type}
          title={`输出: ${h.type}`}
        />
      ))}

      {/* Bottom detail panel near node */}
      <NodeToolbar isVisible={!!selected} position={Position.Bottom} align="center">
        <Paper withBorder shadow="md" radius="md" className="glass" p="sm" style={{ width: 420, transformOrigin: 'top center' }}>
          <Text size="xs" c="dimmed" mb={6}>详情</Text>
          <Textarea autosize minRows={2} placeholder="在这里输入提示词..." value={prompt} onChange={(e)=>setPrompt(e.currentTarget.value)} />
          <Group grow mt={6}>
            <Select label="比例" data={[{value:'16:9',label:'16:9'},{value:'1:1',label:'1:1'},{value:'9:16',label:'9:16'}]} value={aspect} onChange={(v)=>setAspect(v||'16:9')} />
            <NumberInput label="倍率" min={0.5} max={4} step={0.5} value={scale} onChange={(v)=>setScale(Number(v)||1)} />
          </Group>
          <Group justify="flex-end" mt={8}>
            <Button size="xs" onClick={()=>{ updateNodeData(id, { prompt, aspect, scale }); runSelected() }}>一键执行</Button>
          </Group>
        </Paper>
      </NodeToolbar>
    </div>
  )
}

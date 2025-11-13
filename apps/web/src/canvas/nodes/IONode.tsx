import React from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'

type Data = { label?: string; kind: 'io-in' | 'io-out'; types?: string[] }

export default function IONode({ data, selected }: NodeProps<Data>): JSX.Element {
  const isIn = data.kind === 'io-in'
  const types = Array.isArray(data.types) && data.types.length ? data.types : ['any']
  const bg = 'rgba(30,41,59,.9)'
  const br = selected ? '1.5px solid rgba(148,163,184,0.9)' : '1px solid rgba(148,163,184,0.5)'
  const itemH = 14
  const paddingY = 6
  const height = Math.max(22, paddingY * 2 + types.length * itemH)
  const width = 104
  return (
    <div style={{
      width,
      height,
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 6,
      background: bg,
      color: '#cbd5e1',
      fontSize: 11,
      borderRadius: 8,
      border: br,
      boxShadow: '0 2px 8px rgba(0,0,0,.25)',
      paddingTop: 4,
    }}>
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 10, color: '#94a3b8' }}>{isIn ? '入口' : '出口'}</div>
      {types.map((t, idx) => {
        const top = paddingY + idx * itemH
        return isIn ? (
          <Handle key={t} id={`out-${t}`} type="source" position={Position.Right} style={{ top, right: -6, width: 8, height: 8, background: '#8b5cf6' }} />
        ) : (
          <Handle key={t} id={`in-${t}`} type="target" position={Position.Left} style={{ top, left: -6, width: 8, height: 8, background: '#8b5cf6' }} />
        )
      })}
    </div>
  )
}

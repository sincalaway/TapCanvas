import type { Edge, Node } from 'reactflow'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'

export type FlowDto = { id: string; name: string; data: { nodes: Node[]; edges: Edge[] }; createdAt: string; updatedAt: string }

export async function listServerFlows(): Promise<FlowDto[]> {
  const r = await fetch(`${API_BASE}/flows`)
  if (!r.ok) throw new Error(`list flows failed: ${r.status}`)
  return r.json()
}

export async function getServerFlow(id: string): Promise<FlowDto> {
  const r = await fetch(`${API_BASE}/flows/${id}`)
  if (!r.ok) throw new Error(`get flow failed: ${r.status}`)
  return r.json()
}

export async function saveServerFlow(payload: { id?: string; name: string; nodes: Node[]; edges: Edge[] }): Promise<FlowDto> {
  const r = await fetch(`${API_BASE}/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: payload.id, name: payload.name, data: { nodes: payload.nodes, edges: payload.edges } })
  })
  if (!r.ok) throw new Error(`save flow failed: ${r.status}`)
  return r.json()
}

export async function deleteServerFlow(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/flows/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(`delete flow failed: ${r.status}`)
}


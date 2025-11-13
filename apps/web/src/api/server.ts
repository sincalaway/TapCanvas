import type { Edge, Node } from 'reactflow'
import { getAuthToken } from '../auth/store'

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'
function withAuth(init?: RequestInit): RequestInit {
  const t = getAuthToken()
  return { ...(init||{}), headers: { ...(init?.headers||{}), ...(t ? { Authorization: `Bearer ${t}` } : {}) } }
}

export type FlowDto = { id: string; name: string; data: { nodes: Node[]; edges: Edge[] }; createdAt: string; updatedAt: string }
export type ProjectDto = { id: string; name: string; createdAt: string; updatedAt: string }

export async function listServerFlows(): Promise<FlowDto[]> {
  const r = await fetch(`${API_BASE}/flows`, withAuth())
  if (!r.ok) throw new Error(`list flows failed: ${r.status}`)
  return r.json()
}

export async function getServerFlow(id: string): Promise<FlowDto> {
  const r = await fetch(`${API_BASE}/flows/${id}`, withAuth())
  if (!r.ok) throw new Error(`get flow failed: ${r.status}`)
  return r.json()
}

export async function saveServerFlow(payload: { id?: string; name: string; nodes: Node[]; edges: Edge[] }): Promise<FlowDto> {
  const r = await fetch(`${API_BASE}/flows`, withAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: payload.id, name: payload.name, data: { nodes: payload.nodes, edges: payload.edges } })
  }))
  if (!r.ok) throw new Error(`save flow failed: ${r.status}`)
  return r.json()
}

export async function deleteServerFlow(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/flows/${id}`, withAuth({ method: 'DELETE' }))
  if (!r.ok) throw new Error(`delete flow failed: ${r.status}`)
}

export async function exchangeGithub(code: string): Promise<{ token: string; user: any }> {
  const r = await fetch(`${API_BASE}/auth/github/exchange`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
  if (!r.ok) throw new Error(`exchange failed: ${r.status}`)
  return r.json()
}

export async function listFlowVersions(flowId: string): Promise<Array<{ id: string; createdAt: string; name: string }>> {
  const r = await fetch(`${API_BASE}/flows/${flowId}/versions`, withAuth())
  if (!r.ok) throw new Error(`list versions failed: ${r.status}`)
  return r.json()
}

export async function rollbackFlow(flowId: string, versionId: string) {
  const r = await fetch(`${API_BASE}/flows/${flowId}/rollback`, withAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ versionId }) }))
  if (!r.ok) throw new Error(`rollback failed: ${r.status}`)
  return r.json()
}
export async function listProjects(): Promise<ProjectDto[]> {
  const r = await fetch(`${API_BASE}/projects`, withAuth())
  if (!r.ok) throw new Error(`list projects failed: ${r.status}`)
  return r.json()
}

export async function upsertProject(payload: { id?: string; name: string }): Promise<ProjectDto> {
  const r = await fetch(`${API_BASE}/projects`, withAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }))
  if (!r.ok) throw new Error(`save project failed: ${r.status}`)
  return r.json()
}

export async function listProjectFlows(projectId: string): Promise<FlowDto[]> {
  const r = await fetch(`${API_BASE}/flows?projectId=${encodeURIComponent(projectId)}`, withAuth())
  if (!r.ok) throw new Error(`list flows failed: ${r.status}`)
  return r.json()
}

export async function saveProjectFlow(payload: { id?: string; projectId: string; name: string; nodes: Node[]; edges: Edge[] }): Promise<FlowDto> {
  const r = await fetch(`${API_BASE}/flows`, withAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: payload.id, projectId: payload.projectId, name: payload.name, data: { nodes: payload.nodes, edges: payload.edges } }) }))
  if (!r.ok) throw new Error(`save flow failed: ${r.status}`)
  return r.json()
}

// Assets API
export type ServerAssetDto = { id: string; name: string; data: any; createdAt: string; updatedAt: string; projectId?: string|null }

export async function listServerAssets(projectId: string): Promise<ServerAssetDto[]> {
  const r = await fetch(`${API_BASE}/assets?projectId=${encodeURIComponent(projectId)}`, withAuth())
  if (!r.ok) throw new Error(`list assets failed: ${r.status}`)
  return r.json()
}

export async function createServerAsset(payload: { projectId: string; name: string; data: any }): Promise<ServerAssetDto> {
  const r = await fetch(`${API_BASE}/assets`, withAuth({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }))
  if (!r.ok) throw new Error(`create asset failed: ${r.status}`)
  return r.json()
}

export async function renameServerAsset(id: string, name: string): Promise<ServerAssetDto> {
  const r = await fetch(`${API_BASE}/assets/${id}`, withAuth({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }))
  if (!r.ok) throw new Error(`rename asset failed: ${r.status}`)
  return r.json()
}

export async function deleteServerAsset(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/assets/${id}`, withAuth({ method: 'DELETE' }))
  if (!r.ok) throw new Error(`delete asset failed: ${r.status}`)
}

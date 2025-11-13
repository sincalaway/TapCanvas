import { create } from 'zustand'

type UIState = {
  subflowNodeId: string | null
  openSubflow: (nodeId: string) => void
  closeSubflow: () => void
  libraryFlowId: string | null
  openLibraryFlow: (flowId: string) => void
  closeLibraryFlow: () => void
  compact: boolean
  toggleCompact: () => void
  addPanelOpen: boolean
  setAddPanelOpen: (v: boolean) => void
  templatePanelOpen: boolean
  setTemplatePanelOpen: (v: boolean) => void
  activePanel: 'add' | 'template' | 'assets' | null
  setActivePanel: (p: 'add' | 'template' | 'assets' | null) => void
  panelAnchorY: number | null
  setPanelAnchorY: (y: number | null) => void
  paramNodeId: string | null
  openParamFor: (id: string) => void
  closeParam: () => void
  preview: { url: string; kind: 'image'|'video'|'audio'; name?: string } | null
  openPreview: (m: { url: string; kind: 'image'|'video'|'audio'; name?: string }) => void
  closePreview: () => void
  focusStack: string[]
  enterGroupFocus: (id: string) => void
  exitGroupFocus: () => void
  exitAllFocus: () => void
  edgeRoute: 'smooth' | 'orth'
  toggleEdgeRoute: () => void
}

export const useUIStore = create<UIState>((set) => ({
  subflowNodeId: null,
  openSubflow: (nodeId) => set({ subflowNodeId: nodeId }),
  closeSubflow: () => set({ subflowNodeId: null }),
  libraryFlowId: null,
  openLibraryFlow: (flowId) => set({ libraryFlowId: flowId }),
  closeLibraryFlow: () => set({ libraryFlowId: null }),
  compact: false,
  toggleCompact: () => set((s) => ({ compact: !s.compact })),
  addPanelOpen: false,
  setAddPanelOpen: (v) => set({ addPanelOpen: v }),
  templatePanelOpen: false,
  setTemplatePanelOpen: (v) => set({ templatePanelOpen: v }),
  activePanel: null,
  setActivePanel: (p) => set({ activePanel: p }),
  panelAnchorY: null,
  setPanelAnchorY: (y) => set({ panelAnchorY: y }),
  paramNodeId: null,
  openParamFor: (id) => set({ paramNodeId: id }),
  closeParam: () => set({ paramNodeId: null }),
  preview: null,
  openPreview: (m) => set({ preview: m }),
  closePreview: () => set({ preview: null }),
  focusStack: [],
  enterGroupFocus: (id) => set((s) => ({ focusStack: [...s.focusStack, id] })),
  exitGroupFocus: () => set((s) => ({ focusStack: s.focusStack.slice(0, -1) })),
  exitAllFocus: () => set({ focusStack: [] }),
  edgeRoute: 'smooth',
  toggleEdgeRoute: () => set((s) => ({ edgeRoute: s.edgeRoute === 'smooth' ? 'orth' : 'smooth' })),
}))

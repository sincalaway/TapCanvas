import { useEffect } from 'react'
import { useRFStore, persistToLocalStorage } from './canvas/store'
import { useUIStore } from './ui/uiStore'

export default function KeyboardShortcuts() {
  const removeSelected = useRFStore((s) => s.removeSelected)
  const copySelected = useRFStore((s) => s.copySelected)
  const pasteFromClipboard = useRFStore((s) => s.pasteFromClipboard)
  const undo = useRFStore((s) => s.undo)
  const redo = useRFStore((s) => s.redo)
  const selectAll = useRFStore((s) => s.selectAll)
  const clearSelection = useRFStore((s) => s.clearSelection)
  const invertSelection = useRFStore((s) => s.invertSelection)
  const focusStack = useUIStore(s => s.focusStack)
  const exitGroupFocus = useUIStore(s => s.exitGroupFocus)
  const addGroupForSelection = useRFStore((s) => s.addGroupForSelection)
  const layoutGridSelected = useRFStore((s) => s.layoutGridSelected)
  const layoutHorizontalSelected = useRFStore((s) => s.layoutHorizontalSelected)
  const renameSelectedGroup = useRFStore((s) => s.renameSelectedGroup)
  const runSelectedGroup = useRFStore((s) => s.runSelectedGroup)
  const removeGroupById = useRFStore((s) => s.removeGroupById)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const mod = isMac ? e.metaKey : e.ctrlKey
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes((e.target as any)?.tagName)) {
        e.preventDefault()
        removeSelected()
      }
      // Copy
      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        copySelected()
      }
      // Paste
      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteFromClipboard()
      }
      // Undo / Redo
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault()
        redo()
      }
      // Save
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        persistToLocalStorage()
      }
      // Select All / Invert / Clear
      if (mod && e.key.toLowerCase() === 'a' && !e.shiftKey) {
        e.preventDefault(); selectAll()
      }
      if (mod && e.key.toLowerCase() === 'a' && e.shiftKey) {
        e.preventDefault(); invertSelection()
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        const stack = useUIStore.getState().focusStack
        if (stack.length) exitGroupFocus(); else clearSelection()
      }
      // Group / Ungroup
      if (mod && e.key.toLowerCase() === 'g' && !e.shiftKey) {
        e.preventDefault(); addGroupForSelection(undefined)
      }
      if (mod && e.key.toLowerCase() === 'g' && e.shiftKey) {
        e.preventDefault();
        const s = useRFStore.getState()
        const g = s.nodes.find((n: any) => n.type === 'groupNode' && n.selected)
        if (g) removeGroupById(g.id)
      }
      // Layout
      if (!['INPUT','TEXTAREA'].includes((e.target as any)?.tagName)) {
        if (!e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); layoutGridSelected() }
        if (e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); layoutHorizontalSelected() }
      }
      // Rename (F2)
      if (e.key === 'F2') { e.preventDefault(); renameSelectedGroup() }
      // Run (mod+Enter): group if group selected, else node
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        const s = useRFStore.getState()
        const g = s.nodes.find((n: any) => n.type === 'groupNode' && n.selected)
        if (g) runSelectedGroup(); else s.runSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeSelected, copySelected, pasteFromClipboard])

  return null
}

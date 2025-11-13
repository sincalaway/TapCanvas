import React from 'react'
import { AppShell, ActionIcon, Group, Title, Box, Button, TextInput, Select, Badge } from '@mantine/core'
import { IconBrandGithub } from '@tabler/icons-react'
import Canvas from './canvas/Canvas'
import { useRFStore } from './canvas/store'
import './styles.css'
import KeyboardShortcuts from './KeyboardShortcuts'
import { applyTemplate, captureCurrentSelection, deleteTemplate, listTemplateNames, saveTemplate, renameTemplate } from './templates'
import { ToastHost, toast } from './ui/toast'
import { useUIStore } from './ui/uiStore'
import { saveServerFlow } from './api/server'
import { saveFlow as saveLocalFlow } from './flows/registry'
import SubflowEditor from './subflow/Editor'
import LibraryEditor from './flows/LibraryEditor'
import { listFlows, saveFlow, deleteFlow as deleteLibraryFlow, renameFlow, scanCycles } from './flows/registry'
import FloatingNav from './ui/FloatingNav'
import AddNodePanel from './ui/AddNodePanel'
import TemplatePanel from './ui/TemplatePanel'
import AssetPanel from './ui/AssetPanel'
import ParamModal from './ui/ParamModal'
import PreviewModal from './ui/PreviewModal'

export default function App(): JSX.Element {
  const addNode = useRFStore((s) => s.addNode)
  const subflowNodeId = useUIStore(s => s.subflowNodeId)
  const closeSubflow = useUIStore(s => s.closeSubflow)
  const libraryFlowId = useUIStore(s => s.libraryFlowId)
  const closeLibraryFlow = useUIStore(s => s.closeLibraryFlow)
  const [refresh, setRefresh] = React.useState(0)
  const setActivePanel = useUIStore(s => s.setActivePanel)
  const { currentFlow, isDirty } = useUIStore()
  const setDirty = useUIStore(s => s.setDirty)
  const setCurrentFlow = useUIStore(s => s.setCurrentFlow)
  const rfState = useRFStore()

  React.useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (useUIStore.getState().isDirty) {
        e.preventDefault(); e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [])

  // mark dirty on any node/edge change via polling change (simple and safe)
  React.useEffect(() => { setDirty(true) }, [rfState.nodes, rfState.edges, setDirty])

  const doSave = async () => {
    const name = currentFlow.name?.trim() || prompt('工作流名称：')?.trim() || '未命名'
    const nodes = useRFStore.getState().nodes
    const edges = useRFStore.getState().edges
    if (currentFlow.source === 'server') {
      const saved = await saveServerFlow({ id: currentFlow.id || undefined, name, nodes, edges })
      setCurrentFlow({ id: saved.id, name, source: 'server' })
    } else {
      const saved = saveLocalFlow({ id: (currentFlow.id || undefined) as any, name, nodes, edges, io: undefined as any })
      setCurrentFlow({ id: saved.id, name, source: 'local' })
    }
    setDirty(false)
  }

  return (
    <AppShell
      data-compact={'false'}
      header={{ height: 56 }}
      padding={0}
      styles={{
        main: { paddingTop: 56, paddingLeft: 0, paddingRight: 0, background: 'var(--mantine-color-body)' }
      }}
    >
      <AppShell.Header>
        <Group justify="space-between" p="sm">
          <Group>
            <Title order={4}>TapCanvas</Title>
            {isDirty && (<Badge color="red" variant="light">未保存</Badge>)}
          </Group>
          <Group gap="xs">
            <Select size="xs" data={[{value:'local',label:'本地'},{value:'server',label:'服务端'}]} value={currentFlow.source} onChange={(v)=> setCurrentFlow({ source: (v as any)||'local' })} allowDeselect={false} style={{ width: 110 }} />
            <TextInput size="xs" placeholder="名称" value={currentFlow.name} onChange={(e)=> setCurrentFlow({ name: e.currentTarget.value })} style={{ width: 200 }} />
            <Button size="xs" onClick={doSave} disabled={!isDirty}>保存</Button>
            <ActionIcon component="a" href="https://github.com/anymouschina/TapCanvas" target="_blank" rel="noopener noreferrer" variant="subtle" aria-label="GitHub">
              <IconBrandGithub size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      {/* 移除左侧固定栏，改为悬浮灵动岛样式 */}

      <AppShell.Main>
        <Box style={{ height: 'calc(100vh - 56px)', width: '100vw' }} onClick={(e)=>{
          const el = e.target as HTMLElement
          if (!el.closest('[data-ux-floating]') && !el.closest('[data-ux-panel]')) {
            setActivePanel(null)
          }
        }}>
          <Canvas />
        </Box>
      </AppShell.Main>

      {/* 右侧属性栏已移除：节点采取顶部操作条 + 参数弹窗 */}

      <KeyboardShortcuts />
      <ToastHost />
      <FloatingNav />
      <AddNodePanel />
      <TemplatePanel />
      <AssetPanel />
      <ParamModal />
      <PreviewModal />
      {subflowNodeId && (<SubflowEditor nodeId={subflowNodeId} onClose={closeSubflow} />)}
      {libraryFlowId && (<LibraryEditor flowId={libraryFlowId} onClose={closeLibraryFlow} />)}
    </AppShell>
  )
}

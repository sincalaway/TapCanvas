import React from 'react'
import { ActionIcon, Paper, Stack, Tooltip, Avatar, Badge } from '@mantine/core'
import { IconPlus, IconTopologyStar3, IconListDetails, IconHistory, IconPhotoEdit, IconRuler, IconHelpCircle, IconCloudUpload, IconCloudDownload } from '@tabler/icons-react'
import { useUIStore } from './uiStore'
import { notifications } from '@mantine/notifications'
import { useRFStore } from '../canvas/store'
import { listServerFlows, saveServerFlow, getServerFlow } from '../api/server'

export default function FloatingNav(): JSX.Element {
  const { setActivePanel, setPanelAnchorY } = useUIStore()

  const Item = ({ label, icon, onHover, badge }: { label: string; icon: React.ReactNode; onHover: (y: number) => void; badge?: string }) => (
    <Tooltip label={label} position="right" withArrow>
      <div style={{ position: 'relative' }} onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); onHover(r.top + r.height/2) }} data-ux-floating>
        <ActionIcon variant="subtle" size={36} radius="xl" aria-label={label}>
          {icon}
        </ActionIcon>
        {badge && (
          <Badge color="gray" size="xs" variant="light" style={{ position: 'absolute', top: -6, right: -6, borderRadius: 999 }}>{badge}</Badge>
        )}
      </div>
    </Tooltip>
  )

  return (
    <div style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 70 }} data-ux-floating>
      <Paper withBorder shadow="sm" radius="xl" className="glass" p={6} data-ux-floating>
        <Stack align="center" gap={6}>
          <Tooltip label="添加" position="right" withArrow>
            <ActionIcon size={40} radius={999} style={{ background: '#fff', color: '#0b0b0d' }}
              onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPanelAnchorY(r.top + r.height/2); setActivePanel('add') }} data-ux-floating>
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
          <div style={{ height: 6 }} />
          <Item label="工作流" icon={<IconTopologyStar3 size={18} />} onHover={(y) => { setPanelAnchorY(y); setActivePanel('template') }} />
          <Item label="我的资产" icon={<IconListDetails size={18} />} onHover={(y) => { setPanelAnchorY(y); setActivePanel('assets') }} />
          <Item label="历史记录" icon={<IconHistory size={18} />} onHover={() => { /* no panel yet */ }} />
          <Item label="图片编辑" icon={<IconPhotoEdit size={18} />} onHover={() => { /* no panel yet */ }} badge="Beta" />
          <Item label="标尺" icon={<IconRuler size={18} />} onHover={() => { /* no panel yet */ }} />
          <Item label="帮助" icon={<IconHelpCircle size={18} />} onHover={() => { /* no panel yet */ }} />
          {/* Server quick actions */}
          <Tooltip label="保存到服务端" position="right" withArrow>
            <ActionIcon variant="subtle" size={36} radius="xl" aria-label="保存到服务端"
              onClick={async ()=>{
                try {
                  const name = prompt('保存名称：')?.trim(); if (!name) return
                  const s = useRFStore.getState()
                  const saved = await saveServerFlow({ name, nodes: s.nodes, edges: s.edges })
                  notifications.show({ title: '已保存', message: saved.name, color: 'green' })
                } catch (e:any) {
                  notifications.show({ title: '保存失败', message: e?.message || 'error', color: 'red' })
                }
              }} data-ux-floating>
              <IconCloudUpload size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="从服务端载入" position="right" withArrow>
            <ActionIcon variant="subtle" size={36} radius="xl" aria-label="从服务端载入"
              onClick={async ()=>{
                try {
                  const list = await listServerFlows()
                  if (!list.length) { notifications.show({ title: '暂无远程工作流', message: '', color: 'yellow' }); return }
                  const pick = prompt('输入要载入的ID：\n' + list.slice(0,8).map(f=>`${f.id}  ${f.name}`).join('\n'))?.trim()
                  if (!pick) return
                  const rec = await getServerFlow(pick)
                  const data = rec?.data as any
                  if (data?.nodes && data?.edges) {
                    useRFStore.setState({ nodes: data.nodes, edges: data.edges })
                    notifications.show({ title: '已载入', message: rec.name, color: 'green' })
                  } else {
                    notifications.show({ title: '数据不完整', message: '缺少 nodes/edges', color: 'red' })
                  }
                } catch (e:any) {
                  notifications.show({ title: '载入失败', message: e?.message || 'error', color: 'red' })
                }
              }} data-ux-floating>
              <IconCloudDownload size={18} />
            </ActionIcon>
          </Tooltip>
          <div style={{ height: 8 }} />
          <Avatar size={30} radius={999} src={undefined} alt="user" data-ux-floating>
            🐰
          </Avatar>
        </Stack>
      </Paper>
    </div>
  )
}

import React from 'react'

export default function App(): JSX.Element {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>TapCanvas</h1>
      <p>可视化 AI 创作画布（零 GPU）</p>
      <ul>
        <li>React-Flow 画布（待集成）</li>
        <li>Remotion 时间线（待集成）</li>
        <li>Activepieces 编排（已提供 docker compose）</li>
      </ul>
      <p>前端 TypeScript 项目已就绪。</p>
    </div>
  )
}


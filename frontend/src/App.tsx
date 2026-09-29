import { useEffect, useState } from 'react'
import './App.css'

type ApiStatus = 'checking' | 'ok' | 'unreachable'

const statusLabels: Record<ApiStatus, string> = {
  checking: 'checking…',
  ok: 'connected',
  unreachable: 'unreachable (is the backend running?)',
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((body: { status?: string }) =>
        setApiStatus(body.status === 'ok' ? 'ok' : 'unreachable'),
      )
      .catch(() => setApiStatus('unreachable'))
  }, [])

  return (
    <main className="app">
      <h1>Study sheets</h1>
      <p>
        Turn long course PDFs and slides into editable, printable study sheets.
      </p>
      <p className="api-status" data-status={apiStatus}>
        API: {statusLabels[apiStatus]}
      </p>
    </main>
  )
}

export default App

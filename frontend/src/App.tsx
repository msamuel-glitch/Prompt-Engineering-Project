import { useEffect, useState } from 'react'
import { generateSheet, type StudySheetResponse } from './api'
import { SheetView } from './SheetView'
import { UploadForm } from './UploadForm'
import './App.css'
import './print.css'

type ApiStatus = 'checking' | 'ok' | 'unreachable'

const statusLabels: Record<ApiStatus, string> = {
  checking: 'checking…',
  ok: 'connected',
  unreachable: 'unreachable (is the backend running?)',
}

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StudySheetResponse | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((body: { status?: string }) =>
        setApiStatus(body.status === 'ok' ? 'ok' : 'unreachable'),
      )
      .catch(() => setApiStatus('unreachable'))
  }, [])

  async function handleUpload(file: File) {
    setGenerating(true)
    setError(null)
    setResult(null)
    try {
      setResult(await generateSheet(file))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : String(uploadError))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Study sheets</h1>
        <p className="api-status" data-status={apiStatus}>
          API: {statusLabels[apiStatus]}
        </p>
      </header>
      <p className="app-intro">
        Upload a course to get a study sheet. Each section shows the pages or slides
        it comes from, so you can check it against the course.
      </p>

      <UploadForm onUpload={handleUpload} disabled={generating} />

      {generating && (
        <p className="notice" role="status">
          Generating the study sheet… This can take a minute for a long course.
        </p>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {result && <SheetView result={result} />}
    </main>
  )
}

export default App

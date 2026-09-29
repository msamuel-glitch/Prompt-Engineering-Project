import { useCallback, useEffect, useState } from 'react'
import {
  deleteSheet,
  generateSheet,
  listSheets,
  readSheet,
  restoreSheet,
  setTags,
  type SheetSummary,
  type StoredSheet,
} from './api'
import { Library } from './Library'
import { SheetView } from './SheetView'
import { TagEditor } from './TagEditor'
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
  const [open, setOpen] = useState<StoredSheet | null>(null)
  const [library, setLibrary] = useState<SheetSummary[]>([])
  const [tag, setTag] = useState('')

  const refreshLibrary = useCallback(async () => {
    setLibrary(await listSheets())
  }, [])

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((body: { status?: string }) => {
        const reachable = body.status === 'ok'
        setApiStatus(reachable ? 'ok' : 'unreachable')
        if (reachable) {
          void refreshLibrary()
        }
      })
      .catch(() => setApiStatus('unreachable'))
  }, [refreshLibrary])

  /** Run an action that changes a sheet, then keep the library in step. */
  async function run(action: () => Promise<StoredSheet | null>) {
    setError(null)
    try {
      setOpen(await action())
      await refreshLibrary()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
    }
  }

  async function handleUpload(file: File) {
    setGenerating(true)
    setOpen(null)
    await run(() => generateSheet(file))
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    await run(async () => {
      await deleteSheet(id)
      return open?.id === id ? null : open
    })
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
        it comes from, so you can check it against the course. Sheets are saved, so
        you can reopen them from the library below.
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

      {open && (
        <>
          <div className="sheet-tools">
            <TagEditor
              key={open.id}
              tags={open.tags}
              onSave={(tags) => run(() => setTags(open.id, tags))}
            />
            {open.edited && (
              <button type="button" onClick={() => run(() => restoreSheet(open.id))}>
                Restore the AI version
              </button>
            )}
          </div>
          <SheetView result={open} />
        </>
      )}

      <Library
        sheets={library}
        tag={tag}
        openId={open?.id ?? null}
        onTagChange={setTag}
        onOpen={(id) => run(() => readSheet(id))}
        onDelete={handleDelete}
      />
    </main>
  )
}

export default App

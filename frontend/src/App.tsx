import { useCallback, useEffect, useState } from 'react'
import {
  deleteSheet,
  generateSheet,
  listSheets,
  readSheet,
  restoreSheet,
  saveSheet,
  setTags,
  type SheetSummary,
  type StoredSheet,
  type StudySheet,
} from './api'
import { Flashcards } from './Flashcards'
import { Library } from './Library'
import { SheetEditor } from './SheetEditor'
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
  const [saving, setSaving] = useState(false)
  // What the open sheet is showing: reading it, editing it, or revising it.
  const [mode, setMode] = useState<'read' | 'edit' | 'cards'>('read')
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
      return true
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
      return false
    }
  }

  async function handleUpload(file: File) {
    setGenerating(true)
    setMode('read')
    setOpen(null)
    await run(() => generateSheet(file))
    setGenerating(false)
  }

  async function handleOpen(id: string) {
    setMode('read')
    await run(() => readSheet(id))
  }

  async function handleDelete(id: string) {
    if (open?.id === id) {
      setMode('read')
    }
    await run(async () => {
      await deleteSheet(id)
      return open?.id === id ? null : open
    })
  }

  async function handleSave(id: string, sheet: StudySheet) {
    setSaving(true)
    // Stay in the editor if saving failed, so nothing typed is lost.
    if (await run(() => saveSheet(id, sheet))) {
      setMode('read')
    }
    setSaving(false)
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
        you can reopen and rework them from the library below.
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
            {mode !== 'edit' && (
              <>
                <button type="button" onClick={() => setMode('edit')}>
                  Edit this sheet
                </button>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'cards' ? 'read' : 'cards')}
                >
                  {mode === 'cards' ? 'Back to the sheet' : 'Revise with flashcards'}
                </button>
              </>
            )}
            {open.edited && (
              <button type="button" onClick={() => run(() => restoreSheet(open.id))}>
                Restore the AI version
              </button>
            )}
          </div>

          {mode === 'edit' && (
            <SheetEditor
              key={open.id}
              sheet={open.sheet}
              sourceType={open.source_type}
              sourceCount={open.source_count}
              saving={saving}
              onSave={(sheet) => handleSave(open.id, sheet)}
              onCancel={() => setMode('read')}
            />
          )}
          {mode === 'cards' && (
            <Flashcards
              key={open.id}
              sheet={open.sheet}
              sourceType={open.source_type}
            />
          )}
          {mode === 'read' && <SheetView result={open} />}
        </>
      )}

      <Library
        sheets={library}
        tag={tag}
        openId={open?.id ?? null}
        onTagChange={setTag}
        onOpen={handleOpen}
        onDelete={handleDelete}
      />
    </main>
  )
}

export default App

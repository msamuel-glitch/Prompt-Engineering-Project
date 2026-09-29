import { useCallback, useEffect, useState } from 'react'
import {
  deleteSheet,
  generateSheet,
  listFolders,
  listSheets,
  moveSheet,
  readSheet,
  restoreSheet,
  saveSheet,
  setTags,
  type SheetSummary,
  type StoredSheet,
  type StudySheet,
} from './api'
import { Flashcards } from './Flashcards'
import { Home } from './Home'
import { Library } from './Library'
import { Nav, type View } from './Nav'
import { SheetEditor } from './SheetEditor'
import { SheetView } from './SheetView'
import { TagEditor } from './TagEditor'
import { UploadForm } from './UploadForm'
import './App.css'
import './print.css'

type ApiStatus = 'checking' | 'ok' | 'unreachable'

const generatorNotes: Record<string, string> = {
  fixture:
    'Demo mode, because no API key is configured. The synthetic test course returns the sheet recorded from it; any other course returns a placeholder built from its own text, not a summary.',
  fake: 'Placeholder mode: sheets are built from the first lines of each page, with no AI at all.',
}

const KEY_HINT =
  'For real summaries, set ANTHROPIC_API_KEY and STUDY_SHEET_GENERATOR=claude in backend/.env, then restart the backend.'

function App() {
  const [view, setView] = useState<View>('home')
  const [editing, setEditing] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [generator, setGenerator] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<StoredSheet | null>(null)
  const [library, setLibrary] = useState<SheetSummary[]>([])
  const [folders, setFolders] = useState<string[]>([])
  // null shows every sheet, '' the unfiled ones, a name one folder.
  const [folder, setFolder] = useState<string | null>(null)

  const refreshLibrary = useCallback(async () => {
    const [sheets, names] = await Promise.all([listSheets(), listFolders()])
    setLibrary(sheets)
    setFolders(names)
  }, [])

  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((body: { status?: string; generator?: string }) => {
        const reachable = body.status === 'ok'
        setApiStatus(reachable ? 'ok' : 'unreachable')
        setGenerator(body.generator ?? null)
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

  function go(next: View) {
    setError(null)
    setEditing(false)
    setView(next)
  }

  async function handleUpload(file: File) {
    setGenerating(true)
    setEditing(false)
    setOpen(null)
    if (await run(() => generateSheet(file))) {
      setView('sheet')
    }
    setGenerating(false)
  }

  async function handleOpen(id: string) {
    setEditing(false)
    if (await run(() => readSheet(id))) {
      setView('sheet')
    }
  }

  async function handleDelete(id: string) {
    if (open?.id === id) {
      setEditing(false)
    }
    await run(async () => {
      await deleteSheet(id)
      return open?.id === id ? null : open
    })
  }

  async function handleMove(id: string, target: string) {
    await run(async () => {
      const moved = await moveSheet(id, target)
      return open?.id === id ? moved : open
    })
  }

  async function handleSave(id: string, sheet: StudySheet) {
    setSaving(true)
    // Stay in the editor if saving failed, so nothing typed is lost.
    if (await run(() => saveSheet(id, sheet))) {
      setEditing(false)
    }
    setSaving(false)
  }

  const modeNote = generator ? generatorNotes[generator] : undefined

  return (
    <div className="site">
      <Nav
        view={view}
        onNavigate={go}
        libraryCount={library.length}
        openTitle={open?.sheet.title ?? null}
        apiStatus={apiStatus}
        generator={generator}
      />

      <main className="site-main">
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}

        {view === 'home' && <Home onNavigate={go} libraryCount={library.length} />}

        {view === 'upload' && (
          <section className="page">
            <header className="page-head">
              <h1>New study sheet</h1>
              <p className="page-lead">
                Upload one lecture as a PDF or a PowerPoint file. The text of each
                page is extracted with its number, so every section of the sheet can
                point back at where it came from.
              </p>
            </header>

            <UploadForm onUpload={handleUpload} disabled={generating} />

            {modeNote && (
              <p className="notice warn" role="note">
                {modeNote} {KEY_HINT}
              </p>
            )}

            {generating && (
              <p className="notice" role="status">
                Generating the study sheet… This can take a minute for a long course.
              </p>
            )}

            <div className="info-panel">
              <h2>What to expect</h2>
              <ul>
                <li>
                  <strong>Text-based files only.</strong> A scanned or photographed
                  course holds no text to read, and is refused with an explanation
                  rather than summarised into nothing.
                </li>
                <li>
                  <strong>One lecture at a time.</strong> Very long courses are
                  refused to keep one request affordable; upload a part of it.
                </li>
                <li>
                  <strong>Check before you trust.</strong> Each section names the
                  pages it was built from. Warnings appear above the sheet when a
                  section cites a page the file does not have.
                </li>
              </ul>
            </div>
          </section>
        )}

        {view === 'library' && (
          <Library
            sheets={library}
            folders={folders}
            folder={folder}
            openId={open?.id ?? null}
            onFolderChange={setFolder}
            onMove={handleMove}
            onOpen={handleOpen}
            onDelete={handleDelete}
            onCreate={() => go('upload')}
          />
        )}

        {view === 'sheet' &&
          (open ? (
            <section className="page">
              <div className="sheet-tools">
                <TagEditor
                  key={open.id}
                  tags={open.tags}
                  onSave={(tags) => run(() => setTags(open.id, tags))}
                />
                {!editing && (
                  <>
                    <button type="button" onClick={() => setEditing(true)}>
                      Edit this sheet
                    </button>
                    <button type="button" onClick={() => setView('cards')}>
                      Revise with flashcards
                    </button>
                  </>
                )}
                {open.edited && (
                  <button type="button" onClick={() => run(() => restoreSheet(open.id))}>
                    Restore the AI version
                  </button>
                )}
              </div>

              {editing ? (
                <SheetEditor
                  key={open.id}
                  sheet={open.sheet}
                  sourceType={open.source_type}
                  sourceCount={open.source_count}
                  saving={saving}
                  onSave={(sheet) => handleSave(open.id, sheet)}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <SheetView result={open} />
              )}
            </section>
          ) : (
            <NoSheet onNavigate={go} libraryCount={library.length} />
          ))}

        {view === 'cards' &&
          (open ? (
            <section className="page">
              <header className="page-head">
                <h1>Flashcards</h1>
                <p className="page-lead">
                  {open.sheet.title} — one card per section. Recall first, then check.
                </p>
              </header>
              <Flashcards
                key={open.id}
                sheet={open.sheet}
                sourceType={open.source_type}
              />
            </section>
          ) : (
            <NoSheet onNavigate={go} libraryCount={library.length} />
          ))}
      </main>

      <footer className="site-footer">
        <p>
          RectoVerso — a prompt-engineering project. Sheets are stored on this
          machine only.
        </p>
      </footer>
    </div>
  )
}

/** Shown when a view needs an open sheet and there is none. */
function NoSheet({
  onNavigate,
  libraryCount,
}: {
  onNavigate: (view: View) => void
  libraryCount: number
}) {
  return (
    <section className="page">
      <div className="empty-state">
        <p>No sheet is open.</p>
        {libraryCount > 0 ? (
          <button type="button" className="primary" onClick={() => onNavigate('library')}>
            Choose one from my library
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => onNavigate('upload')}>
            Create your first study sheet
          </button>
        )}
      </div>
    </section>
  )
}

export default App

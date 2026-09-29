export type View = 'home' | 'upload' | 'library' | 'sheet' | 'cards'

type ApiStatus = 'checking' | 'ok' | 'unreachable'

type Props = {
  view: View
  onNavigate: (view: View) => void
  libraryCount: number
  openTitle: string | null
  apiStatus: ApiStatus
  generator: string | null
}

const statusLabels: Record<ApiStatus, string> = {
  checking: 'checking…',
  ok: 'connected',
  unreachable: 'unreachable',
}

// How the backend makes sheets, so a student knows what to expect before
// uploading anything rather than being surprised by a placeholder.
const generatorLabels: Record<string, string> = {
  claude: 'AI summaries',
  fixture: 'demo mode',
  fake: 'placeholders, no AI',
}

export function Nav({
  view,
  onNavigate,
  libraryCount,
  openTitle,
  apiStatus,
  generator,
}: Props) {
  // The open sheet earns its own tab: it is a place you go back to, not a
  // state of the library.
  const tabs: { id: View; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'upload', label: 'New sheet' },
    { id: 'library', label: 'My library', badge: String(libraryCount) },
    { id: 'cards', label: 'Flashcards' },
  ]
  if (openTitle) {
    tabs.push({ id: 'sheet', label: 'Current sheet' })
  }

  return (
    <header className="site-header">
      <div className="site-bar">
        <button type="button" className="brand" onClick={() => onNavigate('home')}>
          <span className="brand-mark" aria-hidden="true" />
          RectoVerso
        </button>

        <nav className="site-nav" aria-label="Sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="nav-tab"
              data-active={view === tab.id}
              aria-current={view === tab.id ? 'page' : undefined}
              onClick={() => onNavigate(tab.id)}
            >
              {tab.label}
              {tab.badge !== undefined && <span className="nav-count">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="header-status">
          <span className="api-status" data-status={apiStatus}>
            {statusLabels[apiStatus]}
          </span>
          {generator && (
            <span className="mode-badge" data-mode={generator}>
              {generatorLabels[generator] ?? generator}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

import type { SheetSummary } from './api'
import { FolderPicker } from './FolderPicker'

type Props = {
  sheets: SheetSummary[]
  folders: string[]
  /** null shows every sheet, '' shows the unfiled ones, a name shows a folder. */
  folder: string | null
  openId: string | null
  onFolderChange: (folder: string | null) => void
  onMove: (id: string, folder: string) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

/** How a sheet was made, said plainly on the card.
 *
 * A placeholder and a real summary look alike once they are rows of sections,
 * and mistaking one for the other wastes a revision. The card says which. */
function origin(sheet: SheetSummary): { label: string; tone: string } {
  if (sheet.generator === 'fake') {
    return { label: 'Placeholder — no AI', tone: 'warn' }
  }
  if (sheet.generator === 'fixture') {
    return { label: `Recorded · prompt ${sheet.prompt_version}`, tone: 'neutral' }
  }
  return { label: `${sheet.generator} · prompt ${sheet.prompt_version}`, tone: 'ok' }
}

export function Library({
  sheets,
  folders,
  folder,
  openId,
  onFolderChange,
  onMove,
  onOpen,
  onDelete,
  onCreate,
}: Props) {
  const shown =
    folder === null ? sheets : sheets.filter((sheet) => sheet.folder === folder)
  const countIn = (name: string) =>
    sheets.filter((sheet) => sheet.folder === name).length
  const unfiled = countIn('')

  if (sheets.length === 0) {
    return (
      <section className="page">
        <header className="page-head">
          <h1>My library</h1>
          <p className="page-lead">Every sheet you make is saved here.</p>
        </header>
        <div className="empty-state">
          <p>Nothing here yet.</p>
          <button type="button" className="primary" onClick={onCreate}>
            Create your first study sheet
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-head">
        <h1>My library</h1>
        <p className="page-lead">
          {sheets.length} sheet{sheets.length > 1 ? 's' : ''}, newest first. File
          them in folders by subject, or leave them unfiled.
        </p>
      </header>

      <div className="library-layout">
        <nav className="folder-rail" aria-label="Folders">
          <button
            type="button"
            className="folder-item"
            data-active={folder === null}
            onClick={() => onFolderChange(null)}
          >
            All sheets <span className="folder-count">{sheets.length}</span>
          </button>

          {folders.map((name) => (
            <button
              key={name}
              type="button"
              className="folder-item"
              data-active={folder === name}
              onClick={() => onFolderChange(name)}
            >
              <span className="folder-icon" aria-hidden="true" />
              {name} <span className="folder-count">{countIn(name)}</span>
            </button>
          ))}

          {unfiled > 0 && (
            <button
              type="button"
              className="folder-item"
              data-active={folder === ''}
              onClick={() => onFolderChange('')}
            >
              Unfiled <span className="folder-count">{unfiled}</span>
            </button>
          )}
        </nav>

        <div className="library-body">
          {shown.length === 0 ? (
            <div className="empty-state">
              <p>This folder is empty.</p>
              <button type="button" onClick={() => onFolderChange(null)}>
                Show every sheet
              </button>
            </div>
          ) : (
            <ul className="sheet-grid">
              {shown.map((sheet) => {
                const made = origin(sheet)
                return (
                  <li key={sheet.id}>
                    <article className="sheet-card" data-open={sheet.id === openId}>
                      <h2>
                        <button
                          type="button"
                          className="card-title"
                          onClick={() => onOpen(sheet.id)}
                        >
                          {sheet.title}
                        </button>
                      </h2>

                      <p className="card-origin" data-tone={made.tone}>
                        {made.label}
                      </p>

                      <p className="card-meta">
                        {sheet.section_count} sections · {sheet.word_count} words ·{' '}
                        {sheet.source_count} {sheet.source_type}s
                        {sheet.edited && <span className="badge"> · edited</span>}
                      </p>

                      {/* The first headings, so two sheets on the same course can
                          be told apart without opening either. */}
                      {sheet.preview.length > 0 && (
                        <ul className="card-preview">
                          {sheet.preview.map((heading, index) => (
                            <li key={index}>{heading}</li>
                          ))}
                          {sheet.section_count > sheet.preview.length && (
                            <li className="card-preview-more">
                              and {sheet.section_count - sheet.preview.length} more
                            </li>
                          )}
                        </ul>
                      )}

                      <p className="card-source">
                        {sheet.file_name} ·{' '}
                        {new Date(sheet.created_at).toLocaleDateString()}
                      </p>

                      {sheet.tags.length > 0 && (
                        <p className="card-tags">
                          {sheet.tags.map((name) => (
                            <span key={name} className="tag-pill">
                              {name}
                            </span>
                          ))}
                        </p>
                      )}

                      <div className="card-foot">
                        <FolderPicker
                          value={sheet.folder}
                          folders={folders}
                          onChange={(name) => onMove(sheet.id, name)}
                        />
                        <button
                          type="button"
                          className="link-button danger"
                          onClick={() => onDelete(sheet.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

import type { SheetSummary } from './api'

type Props = {
  sheets: SheetSummary[]
  tag: string
  openId: string | null
  onTagChange: (tag: string) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

/** The saved sheets, newest first, narrowed to one subject.
 *
 * Filtering happens here because the whole library is already loaded; the API
 * also filters server-side (`GET /api/sheets?tag=`) for other clients. */
export function Library({ sheets, tag, openId, onTagChange, onOpen, onDelete }: Props) {
  const tags = [...new Set(sheets.flatMap((sheet) => sheet.tags))].sort()
  const shown = tag ? sheets.filter((sheet) => sheet.tags.includes(tag)) : sheets

  if (sheets.length === 0) {
    return (
      <section className="library">
        <h2>Library</h2>
        <p className="library-empty">
          No sheet saved yet. Upload a course above to make the first one.
        </p>
      </section>
    )
  }

  return (
    <section className="library">
      <h2>Library</h2>

      {tags.length > 0 && (
        <p className="library-filter">
          <label>
            Subject:{' '}
            <select value={tag} onChange={(event) => onTagChange(event.target.value)}>
              <option value="">All ({sheets.length})</option>
              {tags.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </p>
      )}

      {shown.length === 0 ? (
        <p className="library-empty">No sheet tagged “{tag}”.</p>
      ) : (
        <ul className="library-list">
          {shown.map((sheet) => (
            <li key={sheet.id} data-open={sheet.id === openId}>
              <button type="button" className="link-button" onClick={() => onOpen(sheet.id)}>
                {sheet.title}
              </button>
              <span className="library-meta">
                {sheet.file_name} · {sheet.word_count} words ·{' '}
                {new Date(sheet.created_at).toLocaleDateString()}
                {sheet.edited && <span className="badge"> edited</span>}
              </span>
              {sheet.tags.length > 0 && (
                <span className="library-tags">{sheet.tags.join(' · ')}</span>
              )}
              <button
                type="button"
                className="link-button danger"
                onClick={() => onDelete(sheet.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

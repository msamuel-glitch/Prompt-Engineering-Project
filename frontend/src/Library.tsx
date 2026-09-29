import type { SheetSummary } from './api'

type Props = {
  sheets: SheetSummary[]
  tag: string
  openId: string | null
  onTagChange: (tag: string) => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

/** The saved sheets as cards, newest first, narrowed to one subject.
 *
 * Filtering happens here because the whole library is already loaded; the API
 * also filters server-side (`GET /api/sheets?tag=`) for other clients. */
export function Library({
  sheets,
  tag,
  openId,
  onTagChange,
  onOpen,
  onDelete,
  onCreate,
}: Props) {
  const tags = [...new Set(sheets.flatMap((sheet) => sheet.tags))].sort()
  const shown = tag ? sheets.filter((sheet) => sheet.tags.includes(tag)) : sheets

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
          {sheets.length} sheet{sheets.length > 1 ? 's' : ''}, newest first.
        </p>
      </header>

      {tags.length > 0 && (
        <div className="filter-bar">
          <span className="filter-label">Subject</span>
          <button
            type="button"
            className="chip"
            data-active={tag === ''}
            onClick={() => onTagChange('')}
          >
            All
          </button>
          {tags.map((name) => (
            <button
              key={name}
              type="button"
              className="chip"
              data-active={tag === name}
              onClick={() => onTagChange(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="empty-state">
          <p>No sheet tagged “{tag}”.</p>
          <button type="button" onClick={() => onTagChange('')}>
            Show every sheet
          </button>
        </div>
      ) : (
        <ul className="sheet-grid">
          {shown.map((sheet) => (
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

                <p className="card-meta">
                  {sheet.section_count} sections · {sheet.word_count} words ·{' '}
                  {sheet.source_count} {sheet.source_type}s
                  {sheet.edited && <span className="badge"> · edited</span>}
                </p>

                {/* The first headings, so two sheets on the same course can be
                    told apart without opening either. */}
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
                  {sheet.file_name} · {new Date(sheet.created_at).toLocaleDateString()}
                </p>

                <div className="card-foot">
                  {sheet.tags.length > 0 ? (
                    <span className="card-tags">
                      {sheet.tags.map((name) => (
                        <span key={name} className="tag-pill">
                          {name}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="card-untagged">No subject</span>
                  )}
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
          ))}
        </ul>
      )}
    </section>
  )
}

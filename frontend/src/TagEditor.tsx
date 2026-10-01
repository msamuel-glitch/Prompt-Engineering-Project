import { useState } from 'react'

type Props = {
  tags: string[]
  onSave: (tags: string[]) => void
}

/** Subject tags of the open sheet, edited as a comma-separated list.
 *
 * The caller gives this component a key tied to the sheet, so opening another
 * sheet remounts it with that sheet's tags instead of syncing in an effect. */
export function TagEditor({ tags, onSave }: Props) {
  const [draft, setDraft] = useState(tags.join(', '))

  const parsed = draft.split(',').map((tag) => tag.trim()).filter(Boolean)
  const changed = parsed.join('\u0000') !== tags.join('\u0000')

  return (
    <form
      className="tag-editor"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(parsed)
      }}
    >
      <label>
        Subjects{' '}
        <input
          type="text"
          value={draft}
          placeholder="Statistics, Maths"
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button type="submit" disabled={!changed}>
        Save subjects
      </button>
    </form>
  )
}

import { useState } from 'react'

const NEW_FOLDER = '\u0000new'

type Props = {
  value: string
  folders: string[]
  onChange: (folder: string) => void
}

/** Choose the folder a sheet is filed in, or name a new one.
 *
 * A folder exists because a sheet is in it: naming one here creates it, and
 * emptying the last sheet out of it makes it disappear. There is nothing else
 * to manage. */
export function FolderPicker({ value, folders, onChange }: Props) {
  const [naming, setNaming] = useState(false)
  const [draft, setDraft] = useState('')

  if (naming) {
    return (
      <form
        className="folder-picker"
        onSubmit={(event) => {
          event.preventDefault()
          if (draft.trim()) {
            onChange(draft.trim())
          }
          setNaming(false)
          setDraft('')
        }}
      >
        <input
          type="text"
          value={draft}
          autoFocus
          placeholder="Folder name"
          aria-label="New folder name"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={!draft.trim()}>
          File
        </button>
        <button type="button" className="link-button" onClick={() => setNaming(false)}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <label className="folder-picker">
      <span className="visually-hidden">Folder</span>
      <select
        value={value}
        onChange={(event) => {
          if (event.target.value === NEW_FOLDER) {
            setNaming(true)
          } else {
            onChange(event.target.value)
          }
        }}
      >
        <option value="">Unfiled</option>
        {folders.map((folder) => (
          <option key={folder} value={folder}>
            {folder}
          </option>
        ))}
        <option value={NEW_FOLDER}>New folder…</option>
      </select>
    </label>
  )
}

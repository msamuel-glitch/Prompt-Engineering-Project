import { useState, type FormEvent } from 'react'

type Props = {
  onUpload: (file: File) => void
  disabled: boolean
}

export function UploadForm({ onUpload, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (file) {
      onUpload(file)
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label>
        Course file (PDF or PPTX)
        <input
          type="file"
          accept=".pdf,.pptx"
          disabled={disabled}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <button type="submit" className="primary" disabled={disabled || !file}>
        Generate the study sheet
      </button>
    </form>
  )
}

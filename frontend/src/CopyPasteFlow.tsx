import { useRef, useState, type FormEvent } from 'react'
import { importSheet, preparePrompt, type PastePrompt, type StoredSheet } from './api'

type Props = {
  onImported: (sheet: StoredSheet) => void
}

/**
 * Free copy-paste mode: the student runs the application's prompt on
 * claude.ai, then pastes the answer back. Real sheets, no API key, no cost.
 */
export function CopyPasteFlow({ onImported }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [prepared, setPrepared] = useState<PastePrompt | null>(null)
  const [answer, setAnswer] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const promptBox = useRef<HTMLTextAreaElement>(null)

  async function attempt(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure))
    } finally {
      setBusy(false)
    }
  }

  function handlePrepare(event: FormEvent) {
    event.preventDefault()
    if (file) {
      void attempt(async () => {
        setPrepared(await preparePrompt(file))
        setAnswer('')
        setCopied(false)
      })
    }
  }

  async function handleCopy() {
    if (!prepared) {
      return
    }
    try {
      await navigator.clipboard.writeText(prepared.prompt)
      setCopied(true)
    } catch {
      // Some browsers refuse clipboard access: select the text instead.
      promptBox.current?.select()
      setError('Copying was refused by the browser: the prompt is selected, press Ctrl+C.')
    }
  }

  function handleImport(event: FormEvent) {
    event.preventDefault()
    if (file && prepared) {
      void attempt(async () => onImported(await importSheet(file, answer, prepared.prompt_version)))
    }
  }

  const units =
    prepared &&
    `${prepared.source_count} ${prepared.source_type}${prepared.source_count === 1 ? '' : 's'}`

  return (
    <div className="paste-flow">
      <ol className="paste-steps">
        <li>
          <h3>Prepare the prompt</h3>
          <form className="upload-form" onSubmit={handlePrepare}>
            <label>
              Course file (PDF or PPTX)
              <input
                type="file"
                accept=".pdf,.pptx"
                disabled={busy}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setPrepared(null)
                }}
              />
            </label>
            <button type="submit" className="primary" disabled={busy || !file}>
              Prepare the prompt
            </button>
          </form>
        </li>

        {prepared && (
          <li>
            <h3>Run it on claude.ai</h3>
            <p>
              Copy the prompt, paste it into a new conversation on{' '}
              <a href="https://claude.ai/new" target="_blank" rel="noreferrer">
                claude.ai
              </a>{' '}
              (the free plan works) and send it. It holds the text of your {units}{' '}
              and the format Claude must answer in.
            </p>
            <textarea
              ref={promptBox}
              className="paste-prompt"
              readOnly
              rows={6}
              value={prepared.prompt}
              aria-label="Prompt to copy"
            />
            <button type="button" onClick={handleCopy}>
              {copied ? 'Copied ✓' : 'Copy the prompt'}
            </button>
          </li>
        )}

        {prepared && prepared.importable && (
          <li>
            <h3>Bring the answer back</h3>
            <p>
              Copy Claude&apos;s whole reply. If it appears in a panel beside the
              conversation, copy the content of that panel.
            </p>
            <form onSubmit={handleImport}>
              <textarea
                rows={6}
                value={answer}
                placeholder="Paste Claude's reply here"
                aria-label="Claude's reply"
                onChange={(event) => setAnswer(event.target.value)}
              />
              <button type="submit" className="primary" disabled={busy || !answer.trim()}>
                Import the sheet
              </button>
            </form>
          </li>
        )}
      </ol>

      {prepared && !prepared.importable && (
        <p className="notice warn" role="note">
          Prompt {prepared.prompt_version} asks for free text, which cannot be
          imported: use its answer for the evaluation only.
        </p>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

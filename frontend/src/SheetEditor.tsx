import { useState } from 'react'
import type { SourceType, StudySheet } from './api'
import {
  addPoint,
  addSection,
  clean,
  formatSourcesInput,
  moveSection,
  parseSources,
  removePoint,
  removeSection,
  setPoint,
  setTitle,
  updateSection,
} from './edits'
import { estimateFit } from './fit'

type Props = {
  sheet: StudySheet
  sourceType: SourceType
  sourceCount: number
  saving: boolean
  onSave: (sheet: StudySheet) => void
  onCancel: () => void
}

export function SheetEditor({
  sheet,
  sourceType,
  sourceCount,
  saving,
  onSave,
  onCancel,
}: Props) {
  const [draft, setDraft] = useState(sheet)
  // Source numbers are kept as text while they are being typed, so that a
  // half-written "3, " is not reformatted under the cursor.
  const [sourceTexts, setSourceTexts] = useState(() =>
    sheet.sections.map((section) => formatSourcesInput(section.sources)),
  )

  /** Apply a change that adds, removes or moves a section. */
  function restructure(next: StudySheet) {
    setDraft(next)
    setSourceTexts(next.sections.map((section) => formatSourcesInput(section.sources)))
  }

  function editSources(index: number, text: string) {
    setSourceTexts(sourceTexts.map((value, position) => (position === index ? text : value)))
    setDraft(updateSection(draft, index, { sources: parseSources(text) }))
  }

  const fit = estimateFit(draft)
  const percentage = Math.round(fit.ratio * 100)
  const unit = sourceType === 'page' ? 'pages' : 'slides'

  return (
    <form
      className="sheet-editor"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(clean(draft))
      }}
    >
      <p className="fit-gauge" data-overflows={fit.overflows} role="status">
        {fit.overflows
          ? `Estimated at ${percentage}% of the two pages: shorten a section before saving, or accept a third page.`
          : `Estimated at ${percentage}% of the two pages.`}
      </p>

      <label className="sheet-title-field">
        Title of the sheet
        <input
          type="text"
          value={draft.title}
          onChange={(event) => setDraft(setTitle(draft, event.target.value))}
        />
      </label>

      {draft.sections.map((section, index) => {
        const beyond = section.sources.filter((number) => number > sourceCount)
        return (
          <fieldset key={index} className="section-field">
            <legend>Section {index + 1}</legend>

            <div className="section-controls">
              <button
                type="button"
                onClick={() => restructure(moveSection(draft, index, -1))}
                disabled={index === 0}
                aria-label={`Move section ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => restructure(moveSection(draft, index, 1))}
                disabled={index === draft.sections.length - 1}
                aria-label={`Move section ${index + 1} down`}
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => restructure(removeSection(draft, index))}
              >
                Remove section
              </button>
            </div>

            <label>
              Heading
              <input
                type="text"
                value={section.title}
                onChange={(event) =>
                  setDraft(updateSection(draft, index, { title: event.target.value }))
                }
              />
            </label>

            <span className="field-label">Key ideas</span>
            {section.points.map((point, pointIndex) => (
              <div key={pointIndex} className="point-field">
                <textarea
                  rows={2}
                  value={point}
                  aria-label={`Idea ${pointIndex + 1} of section ${index + 1}`}
                  onChange={(event) =>
                    setDraft(setPoint(draft, index, pointIndex, event.target.value))
                  }
                />
                <button
                  type="button"
                  className="link-button danger"
                  onClick={() => setDraft(removePoint(draft, index, pointIndex))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="link-button"
              onClick={() => setDraft(addPoint(draft, index))}
            >
              Add an idea
            </button>

            <label>
              Source {unit}
              <input
                type="text"
                value={sourceTexts[index] ?? ''}
                placeholder="3, 5"
                onChange={(event) => editSources(index, event.target.value)}
              />
            </label>
            {beyond.length > 0 && (
              <p className="field-warning" role="alert">
                The course has {sourceCount} {unit}: {beyond.join(', ')} cannot be right.
              </p>
            )}
          </fieldset>
        )
      })}

      <div className="editor-actions">
        <button type="button" onClick={() => restructure(addSection(draft))}>
          Add a section
        </button>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}

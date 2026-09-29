import type { StudySheetResponse } from './api'
import { estimateFit } from './fit'
import { formatSources } from './sources'

type Props = {
  result: StudySheetResponse
}

export function SheetView({ result }: Props) {
  const { sheet } = result
  const unit = result.source_count === 1 ? result.source_type : `${result.source_type}s`
  const origin =
    result.generator === 'fake'
      ? 'placeholder sheet, no AI'
      : `${result.generator}, prompt ${result.prompt_version}`
  const fit = estimateFit(sheet)
  const percentage = Math.round(fit.ratio * 100)

  return (
    <article className="sheet">
      <h2>{sheet.title}</h2>
      <p className="sheet-meta">
        {result.file_name} ({result.source_count} {unit}) · {result.word_count} words ·{' '}
        {origin}
        <button type="button" className="link-button" onClick={() => downloadJson(result)}>
          Download (JSON)
        </button>
      </p>

      <div className="sheet-actions">
        <button type="button" onClick={() => window.print()}>
          Print / save as PDF
        </button>
      </div>

      <p className="fit-gauge" data-overflows={fit.overflows} role="note">
        {fit.overflows
          ? `Estimated at ${percentage}% of the two pages: it will probably run onto a third one. Shorten or remove a section, then check the print preview.`
          : `Estimated at ${percentage}% of the two pages.`}{' '}
        <span className="fit-caveat">
          This is an estimate from the text length; the print preview is what decides.
        </span>
      </p>

      {result.warnings.length > 0 && (
        <div className="warnings" role="note">
          <h3>To check</h3>
          <ul>
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {sheet.sections.map((section, index) => (
        <section key={index} className="sheet-section">
          <h3>{section.title}</h3>
          <ul>
            {section.points.map((point, pointIndex) => (
              <li key={pointIndex}>{point}</li>
            ))}
          </ul>
          <p className="sources">{formatSources(section.sources, result.source_type)}</p>
        </section>
      ))}
    </article>
  )
}

// Saves the whole result, including the model and prompt version, for example
// to keep outputs for the prompt evaluation.
function downloadJson(result: StudySheetResponse) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${result.file_name.replace(/\.[^.]+$/, '')}-study-sheet.json`
  link.click()
  URL.revokeObjectURL(url)
}

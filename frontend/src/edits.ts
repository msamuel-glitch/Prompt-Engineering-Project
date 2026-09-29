import type { Section, StudySheet } from './api'

// Changing a sheet section by section. Every function returns a new sheet and
// leaves the one it is given untouched, so the caller can keep the version it
// started from and cancel by dropping the draft.

const EMPTY_SECTION: Section = { title: '', points: [''], sources: [] }

export function setTitle(sheet: StudySheet, title: string): StudySheet {
  return { ...sheet, title }
}

export function updateSection(
  sheet: StudySheet,
  index: number,
  changes: Partial<Section>,
): StudySheet {
  const sections = sheet.sections.map((section, position) =>
    position === index ? { ...section, ...changes } : section,
  )
  return { ...sheet, sections }
}

export function addSection(sheet: StudySheet): StudySheet {
  return { ...sheet, sections: [...sheet.sections, { ...EMPTY_SECTION }] }
}

export function removeSection(sheet: StudySheet, index: number): StudySheet {
  const sections = sheet.sections.filter((_, position) => position !== index)
  return { ...sheet, sections }
}

/** Swap a section with the one before or after it; ends stay put. */
export function moveSection(sheet: StudySheet, index: number, by: -1 | 1): StudySheet {
  const target = index + by
  if (target < 0 || target >= sheet.sections.length) {
    return sheet
  }
  const sections = [...sheet.sections]
  ;[sections[index], sections[target]] = [sections[target], sections[index]]
  return { ...sheet, sections }
}

export function setPoint(
  sheet: StudySheet,
  index: number,
  pointIndex: number,
  text: string,
): StudySheet {
  const points = sheet.sections[index].points.map((point, position) =>
    position === pointIndex ? text : point,
  )
  return updateSection(sheet, index, { points })
}

export function addPoint(sheet: StudySheet, index: number): StudySheet {
  return updateSection(sheet, index, { points: [...sheet.sections[index].points, ''] })
}

/** Remove a point, keeping at least one so a section is never left with none. */
export function removePoint(
  sheet: StudySheet,
  index: number,
  pointIndex: number,
): StudySheet {
  const remaining = sheet.sections[index].points.filter(
    (_, position) => position !== pointIndex,
  )
  return updateSection(sheet, index, { points: remaining.length > 0 ? remaining : [''] })
}

/** Read "3, 5, 5, x, 8" as [3, 5, 8]: page numbers, without repeats or noise. */
export function parseSources(text: string): number[] {
  const numbers = text
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0)
  return [...new Set(numbers)]
}

export function formatSourcesInput(numbers: number[]): string {
  return numbers.join(', ')
}

/** Drop the empty points and sections a student left behind while editing. */
export function clean(sheet: StudySheet): StudySheet {
  const sections = sheet.sections
    .map((section) => ({
      ...section,
      title: section.title.trim(),
      points: section.points.map((point) => point.trim()).filter(Boolean),
    }))
    .filter((section) => section.title !== '' || section.points.length > 0)
  return { ...sheet, title: sheet.title.trim(), sections }
}

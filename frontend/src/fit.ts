import type { Section, StudySheet } from './api'

// How much of the two printed pages a sheet fills.
//
// The AI cannot see the layout, so the length is budgeted in characters rather
// than measured (the "2-page limit" watch-out of the project plan). The
// constants below describe the print stylesheet in print.css: if one changes,
// change the other. This is an early warning, not a measurement — the real
// check is the browser's print preview.

/** Characters on one line of body text: a 180mm column at 11pt. */
export const CHARACTERS_PER_LINE = 95

/** Lines of body text on one A4 page: 267mm at 11pt with a 1.35 line height. */
export const LINES_PER_PAGE = 50

/** The sheet is designed for two A4 pages. */
export const PAGE_COUNT = 2

/** Lines taken by the sheet title and its meta line, before the first section. */
export const HEADER_LINES = 4

/** Lines left for the sections themselves. */
export const LINE_BUDGET = LINES_PER_PAGE * PAGE_COUNT - HEADER_LINES

export type Fit = {
  lines: number
  budget: number
  /** Share of the two pages used: 1 means exactly full. */
  ratio: number
  overflows: boolean
}

/** Lines a piece of text takes once wrapped. */
export function linesFor(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARACTERS_PER_LINE))
}

/** Lines a whole sheet takes, section headings and source lines included. */
export function estimateLines(sheet: StudySheet): number {
  return sheet.sections.reduce((total: number, section: Section) => {
    const points = section.points.reduce((sum: number, point: string) => sum + linesFor(point), 0)
    // One line for the heading, one for the sources, one blank line after.
    return total + linesFor(section.title) + points + 2
  }, 0)
}

export function estimateFit(sheet: StudySheet): Fit {
  const lines = estimateLines(sheet)
  return {
    lines,
    budget: LINE_BUDGET,
    ratio: lines / LINE_BUDGET,
    overflows: lines > LINE_BUDGET,
  }
}

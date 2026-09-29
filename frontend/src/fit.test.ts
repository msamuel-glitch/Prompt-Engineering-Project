import { describe, expect, it } from 'vitest'
import type { StudySheet } from './api'
import {
  CHARACTERS_PER_LINE,
  LINE_BUDGET,
  estimateFit,
  estimateLines,
  linesFor,
} from './fit'

function sheetOf(sections: StudySheet['sections']): StudySheet {
  return { title: 'Course', sections }
}

const section = { title: 'Intro', points: ['a', 'b'], sources: [1] }

describe('linesFor', () => {
  it('counts a short text as one line', () => {
    expect(linesFor('a short point')).toBe(1)
  })

  it('counts an empty text as one line rather than none', () => {
    expect(linesFor('')).toBe(1)
  })

  it('wraps a text longer than one line', () => {
    expect(linesFor('x'.repeat(CHARACTERS_PER_LINE))).toBe(1)
    expect(linesFor('x'.repeat(CHARACTERS_PER_LINE + 1))).toBe(2)
  })
})

describe('estimateLines', () => {
  it('counts the heading, the points, the sources and the spacing', () => {
    // 1 heading + 2 points + 1 sources line + 1 blank line.
    expect(estimateLines(sheetOf([section]))).toBe(5)
  })

  it('adds up the sections', () => {
    expect(estimateLines(sheetOf([section, section]))).toBe(10)
  })
})

describe('estimateFit', () => {
  it('reports a short sheet as fitting', () => {
    const fit = estimateFit(sheetOf([section]))
    expect(fit.overflows).toBe(false)
    expect(fit.budget).toBe(LINE_BUDGET)
    expect(fit.ratio).toBeCloseTo(5 / LINE_BUDGET)
  })

  it('reports a sheet longer than two pages as overflowing', () => {
    const fit = estimateFit(sheetOf(Array(20).fill(section)))
    expect(fit.lines).toBe(100)
    expect(fit.overflows).toBe(true)
  })
})

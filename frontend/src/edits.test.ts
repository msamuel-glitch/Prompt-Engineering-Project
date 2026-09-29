import { describe, expect, it } from 'vitest'
import type { StudySheet } from './api'
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

function sheet(): StudySheet {
  return {
    title: 'Statistics',
    sections: [
      { title: 'Regression', points: ['y = a + bx'], sources: [1] },
      { title: 'R squared', points: ['Goodness of fit'], sources: [2] },
    ],
  }
}

const titles = (result: StudySheet) => result.sections.map((section) => section.title)

describe('editing a sheet', () => {
  it('leaves the sheet it is given untouched', () => {
    const original = sheet()

    setTitle(original, 'Changed')
    updateSection(original, 0, { title: 'Changed' })
    removeSection(original, 0)

    expect(original).toEqual(sheet())
  })

  it('changes one section without touching the others', () => {
    const result = updateSection(sheet(), 0, { title: 'Linear regression' })

    expect(titles(result)).toEqual(['Linear regression', 'R squared'])
  })

  it('adds an empty section at the end', () => {
    const result = addSection(sheet())

    expect(result.sections).toHaveLength(3)
    expect(result.sections[2]).toEqual({ title: '', points: [''], sources: [] })
  })

  it('removes a section', () => {
    expect(titles(removeSection(sheet(), 0))).toEqual(['R squared'])
  })
})

describe('moveSection', () => {
  it('swaps a section with its neighbour', () => {
    expect(titles(moveSection(sheet(), 0, 1))).toEqual(['R squared', 'Regression'])
    expect(titles(moveSection(sheet(), 1, -1))).toEqual(['R squared', 'Regression'])
  })

  it('does nothing at either end', () => {
    expect(moveSection(sheet(), 0, -1)).toEqual(sheet())
    expect(moveSection(sheet(), 1, 1)).toEqual(sheet())
  })
})

describe('editing the points of a section', () => {
  it('changes one point', () => {
    const result = setPoint(sheet(), 0, 0, 'y = ax + b')

    expect(result.sections[0].points).toEqual(['y = ax + b'])
  })

  it('adds an empty point', () => {
    expect(addPoint(sheet(), 0).sections[0].points).toEqual(['y = a + bx', ''])
  })

  it('keeps one point rather than leaving a section with none', () => {
    expect(removePoint(sheet(), 0, 0).sections[0].points).toEqual([''])
  })
})

describe('parseSources', () => {
  it('reads numbers separated by commas, spaces or semicolons', () => {
    expect(parseSources('3, 5 8;11')).toEqual([3, 5, 8, 11])
  })

  it('ignores repeats and anything that is not a page number', () => {
    expect(parseSources('3, 3, x, -2, 0, 4.5')).toEqual([3])
  })

  it('reads back what it writes', () => {
    expect(parseSources(formatSourcesInput([2, 7]))).toEqual([2, 7])
  })
})

describe('clean', () => {
  it('trims the text and drops the empty points', () => {
    const draft: StudySheet = {
      title: '  Statistics  ',
      sections: [{ title: '  Regression ', points: ['  y = a + bx  ', '   '], sources: [1] }],
    }

    const result = clean(draft)

    expect(result.title).toBe('Statistics')
    expect(result.sections[0]).toEqual({
      title: 'Regression',
      points: ['y = a + bx'],
      sources: [1],
    })
  })

  it('drops a section left completely empty', () => {
    const draft: StudySheet = {
      title: 'Statistics',
      sections: [
        { title: 'Regression', points: ['y'], sources: [] },
        { title: '  ', points: ['', '  '], sources: [] },
      ],
    }

    expect(titles(clean(draft))).toEqual(['Regression'])
  })
})

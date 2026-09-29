import { describe, expect, it } from 'vitest'
import type { StudySheet } from './api'
import { shuffle, toFlashcards } from './cards'

const sheet: StudySheet = {
  title: 'Régression linéaire',
  sections: [
    { title: 'Le modèle', points: ['y = β0 + β1·x + ε', 'β1 est la pente'], sources: [3] },
    { title: 'Le R²', points: ['Part de variance expliquée'], sources: [7] },
  ],
}

describe('toFlashcards', () => {
  it('makes one card per section, the heading asking for the key ideas', () => {
    const cards = toFlashcards(sheet)

    expect(cards).toHaveLength(2)
    expect(cards[0]).toEqual({
      question: 'Le modèle',
      answers: ['y = β0 + β1·x + ε', 'β1 est la pente'],
      sources: [3],
    })
  })

  it('skips a section that has no heading or no key idea', () => {
    const draft: StudySheet = {
      title: 'Course',
      sections: [
        { title: '  ', points: ['orphan'], sources: [] },
        { title: 'Empty', points: [], sources: [] },
        { title: 'Kept', points: ['a point'], sources: [1] },
      ],
    }

    expect(toFlashcards(draft).map((card) => card.question)).toEqual(['Kept'])
  })

  it('follows the sheet as it is edited, since nothing is stored', () => {
    const edited: StudySheet = {
      ...sheet,
      sections: [{ ...sheet.sections[0], title: 'Renamed' }],
    }

    expect(toFlashcards(edited)[0].question).toBe('Renamed')
  })
})

describe('shuffle', () => {
  it('keeps every item', () => {
    const items = [1, 2, 3, 4, 5]

    expect([...shuffle(items)].sort()).toEqual(items)
  })

  it('leaves the list it is given untouched', () => {
    const items = [1, 2, 3]

    shuffle(items, () => 0)

    expect(items).toEqual([1, 2, 3])
  })

  it('uses the source of randomness it is given', () => {
    // Always drawing the first position reverses the list, walking backwards.
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1])
  })
})

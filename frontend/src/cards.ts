import type { StudySheet } from './api'

export type Flashcard = {
  question: string
  answers: string[]
  sources: number[]
}

/** One card per section: recall its key ideas from its heading alone.
 *
 * Cards are derived from the sheet every time rather than stored alongside it.
 * Editing a section therefore changes its card at once, and a card can never
 * describe a version of a section that no longer exists. This is what the plan
 * calls deciding "when study aids are regenerated after edits": always.
 *
 * No AI call is involved. The sections and their key ideas were written by the
 * model when the sheet was generated; turning a heading into a question and its
 * points into the answer is a rearrangement of that same text. */
export function toFlashcards(sheet: StudySheet): Flashcard[] {
  return sheet.sections
    .filter((section) => section.title.trim() !== '' && section.points.length > 0)
    .map((section) => ({
      question: section.title,
      answers: section.points,
      sources: section.sources,
    }))
}

/** A shuffled copy, so revising does not follow the order of the sheet.
 *
 * The source of randomness is a parameter so tests can fix the order. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

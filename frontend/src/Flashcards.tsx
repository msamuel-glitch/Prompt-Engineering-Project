import { useMemo, useState } from 'react'
import type { SourceType, StudySheet } from './api'
import { shuffle, toFlashcards } from './cards'
import { formatSources } from './sources'

type Props = {
  sheet: StudySheet
  sourceType: SourceType
}

/** Revise a sheet one section at a time: recall, then check. */
export function Flashcards({ sheet, sourceType }: Props) {
  const cards = useMemo(() => toFlashcards(sheet), [sheet])
  // Bumping the draw reshuffles; draw 0 keeps the order of the sheet.
  const [draw, setDraw] = useState(0)
  const order = useMemo(() => (draw === 0 ? cards : shuffle(cards)), [cards, draw])
  const [position, setPosition] = useState(0)
  const [revealed, setRevealed] = useState(false)

  if (order.length === 0) {
    return (
      <p className="notice" role="note">
        No flashcard yet: a section needs a heading and at least one key idea.
      </p>
    )
  }

  // The sheet can shrink under the deck if a section was just removed.
  const index = Math.min(position, order.length - 1)
  const card = order[index]

  function go(by: number) {
    setPosition((index + by + order.length) % order.length)
    setRevealed(false)
  }

  function reshuffle() {
    setDraw(draw + 1)
    setPosition(0)
    setRevealed(false)
  }

  return (
    <section className="flashcards">
      <p className="flashcards-progress">
        Card {index + 1} of {order.length}
      </p>

      <div
        className="flashcard"
        data-revealed={revealed}
        role="button"
        tabIndex={0}
        aria-label={revealed ? 'Card answer, select to hide' : 'Card question, select to reveal'}
        onClick={() => setRevealed(!revealed)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            setRevealed(!revealed)
          } else if (event.key === 'ArrowRight') {
            go(1)
          } else if (event.key === 'ArrowLeft') {
            go(-1)
          }
        }}
      >
        <h3>{card.question}</h3>
        {revealed ? (
          <>
            <ul>
              {card.answers.map((answer, answerIndex) => (
                <li key={answerIndex}>{answer}</li>
              ))}
            </ul>
            <p className="sources">{formatSources(card.sources, sourceType)}</p>
          </>
        ) : (
          <p className="flashcard-hint">
            Recall the key ideas, then select the card to check.
          </p>
        )}
      </div>

      <div className="flashcards-controls">
        <button type="button" onClick={() => go(-1)}>
          Previous
        </button>
        <button type="button" onClick={() => setRevealed(!revealed)}>
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        <button type="button" onClick={() => go(1)}>
          Next
        </button>
        <button type="button" onClick={reshuffle}>
          Shuffle
        </button>
      </div>
    </section>
  )
}

import type { SourceType } from './api'

/** "Pages 3–5, 8" from [3, 4, 5, 8]: the reference shown under a section. */
export function formatSources(numbers: number[], type: SourceType): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b)
  if (sorted.length === 0) {
    return 'No source given'
  }

  const ranges: string[] = []
  let start = sorted[0]
  let end = start
  for (const number of sorted.slice(1)) {
    if (number === end + 1) {
      end = number
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`)
      start = number
      end = number
    }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`)

  const noun = type === 'page' ? 'Page' : 'Slide'
  return `${noun}${sorted.length > 1 ? 's' : ''} ${ranges.join(', ')}`
}

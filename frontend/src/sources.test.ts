import { describe, expect, it } from 'vitest'
import { formatSources } from './sources'

describe('formatSources', () => {
  it('names a single page or slide', () => {
    expect(formatSources([4], 'page')).toBe('Page 4')
    expect(formatSources([4], 'slide')).toBe('Slide 4')
  })

  it('groups consecutive numbers into ranges', () => {
    expect(formatSources([8, 3, 4, 5], 'page')).toBe('Pages 3–5, 8')
  })

  it('ignores duplicates', () => {
    expect(formatSources([2, 2], 'slide')).toBe('Slide 2')
  })

  it('says when there is no source', () => {
    expect(formatSources([], 'page')).toBe('No source given')
  })
})

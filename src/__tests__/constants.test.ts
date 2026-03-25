import { describe, it, expect } from 'vitest'
import { TIMER_MODES, getThumbnailUrl } from '../constants'

describe('TIMER_MODES', () => {
  it('has correct pomodoro duration of 25 minutes', () => {
    expect(TIMER_MODES.POMODORO.duration).toBe(25 * 60)
  })

  it('has correct short break duration of 5 minutes', () => {
    expect(TIMER_MODES.SHORT_BREAK.duration).toBe(5 * 60)
  })

  it('has correct long break duration of 15 minutes', () => {
    expect(TIMER_MODES.LONG_BREAK.duration).toBe(15 * 60)
  })

  it('has human-readable labels', () => {
    expect(TIMER_MODES.POMODORO.label).toBe('pomodoro')
    expect(TIMER_MODES.SHORT_BREAK.label).toBe('short break')
    expect(TIMER_MODES.LONG_BREAK.label).toBe('long break')
  })

  it('orders sessions from longest to shortest', () => {
    expect(TIMER_MODES.POMODORO.duration).toBeGreaterThan(TIMER_MODES.SHORT_BREAK.duration)
    expect(TIMER_MODES.LONG_BREAK.duration).toBeGreaterThan(TIMER_MODES.SHORT_BREAK.duration)
  })
})

describe('getThumbnailUrl', () => {
  it('replaces the width query param with 150', () => {
    const url = 'https://images.unsplash.com/photo-123?w=4800&q=100'
    expect(getThumbnailUrl(url)).toBe('https://images.unsplash.com/photo-123?w=150&q=100')
  })

  it('returns the url unchanged when no width param is present', () => {
    const url = 'https://example.com/image.jpg'
    expect(getThumbnailUrl(url)).toBe('https://example.com/image.jpg')
  })

  it('handles any numeric width value', () => {
    const url = 'https://images.unsplash.com/photo-abc?w=1200&q=80'
    expect(getThumbnailUrl(url)).toBe('https://images.unsplash.com/photo-abc?w=150&q=80')
  })
})

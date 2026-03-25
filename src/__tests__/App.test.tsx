import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'

// Stub child components — they have their own concerns and are tested separately
vi.mock('../BackgroundSlider', () => ({ default: () => <div data-testid="bg-slider" /> }))
vi.mock('../SpotifyWidget', () => ({ default: () => <div data-testid="spotify-widget" /> }))
vi.mock('../SettingsWidget', () => ({ default: (_props: unknown) => <div data-testid="settings-widget" /> }))

// Stub utility modules that interact with browser / network APIs
vi.mock('../utils/imageCache', () => ({
  imageCache: {
    preloadAllBackgrounds: vi.fn().mockResolvedValue({ loaded: 0, total: 0, failed: [] }),
  },
}))
vi.mock('../utils/serviceWorker', () => ({
  registerServiceWorker: vi.fn(),
}))

/** Renders App and flushes all async effects (e.g. Notification.requestPermission) */
async function renderApp() {
  await act(async () => {
    render(<App />)
  })
}

describe('App — initial render', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the pomodoro timer at 25:00 by default', async () => {
    await renderApp()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('renders all three mode buttons', async () => {
    await renderApp()
    expect(screen.getByRole('button', { name: 'pomodoro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'short break' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'long break' })).toBeInTheDocument()
  })

  it('renders start and reset controls', async () => {
    await renderApp()
    expect(screen.getByRole('button', { name: 'start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'reset' })).toBeInTheDocument()
  })
})

describe('App — mode switching', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows 05:00 when short break mode is selected', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'short break' }))
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('shows 15:00 when long break mode is selected', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'long break' }))
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('returns to pomodoro time after switching back', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'short break' }))
    fireEvent.click(screen.getByRole('button', { name: 'pomodoro' }))
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })
})

describe('App — timer controls', () => {
  beforeEach(() => vi.clearAllMocks())

  it('toggles to pause when start is clicked', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'start' }))
    expect(screen.getByRole('button', { name: 'pause' })).toBeInTheDocument()
  })

  it('toggles back to start when pause is clicked', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'start' }))
    fireEvent.click(screen.getByRole('button', { name: 'pause' }))
    expect(screen.getByRole('button', { name: 'start' })).toBeInTheDocument()
  })

  it('resets timer to current mode duration', async () => {
    await renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'short break' }))
    // Start and then reset
    fireEvent.click(screen.getByRole('button', { name: 'start' }))
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    expect(screen.getByText('05:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'start' })).toBeInTheDocument()
  })
})

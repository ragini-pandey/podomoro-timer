import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Stub HTMLMediaElement.play — jsdom does not implement it
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

// Stub Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: class MockNotification {
    static permission: NotificationPermission = 'default'
    static requestPermission = vi.fn().mockResolvedValue('default' as NotificationPermission)
    constructor(_title: string, _options?: NotificationOptions) {}
  },
})

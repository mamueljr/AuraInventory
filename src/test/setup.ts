import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom no trae ResizeObserver (lo usa el grid virtualizado)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

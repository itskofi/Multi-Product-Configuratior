import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Polaris components for testing
vi.mock('@shopify/polaris', async () => {
  const actual = await vi.importActual('@shopify/polaris')
  return {
    ...actual,
    AppProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

// Mock environment variables
process.env.SHOPIFY_API_KEY = 'test-api-key'

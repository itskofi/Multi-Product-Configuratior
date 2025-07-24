import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMultiCart } from '../utils/useMultiCart'
import type { ConfiguredProduct } from '../types'

// Mock the fetch function
global.fetch = vi.fn()

describe('useMultiCart Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('returns correct initial state', () => {
    const { result } = renderHook(() => useMultiCart())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.success).toBe(false)
    expect(typeof result.current.addMultipleToCart).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('handles loading states correctly', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    const mockProducts: ConfiguredProduct[] = [
      {
        variantId: 'variant-1',
        quantity: 2,
        properties: { customText: 'Test text', slot: '1' }
      }
    ]

    // Start the async operation but don't await immediately
    let promise: Promise<any>
    act(() => {
      promise = result.current.addMultipleToCart(mockProducts)
    })

    // Should be loading immediately after the action
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.success).toBe(false)

    // Wait for the promise to complete
    await act(async () => {
      await promise
    })

    // Should be successful and not loading
    expect(result.current.isLoading).toBe(false)
    expect(result.current.success).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('processes valid products correctly', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    const mockProducts: ConfiguredProduct[] = [
      {
        variantId: 'variant-1',
        quantity: 2,
        properties: { customText: 'Test text 1', slot: '1' }
      },
      {
        variantId: 'variant-2',
        quantity: 1,
        properties: { customText: 'Test text 2', slot: '2' }
      }
    ]

    let response
    await act(async () => {
      response = await result.current.addMultipleToCart(mockProducts)
    })

    // Should return success response
    expect(response).toEqual({
      success: true,
      items: [
        {
          id: 'variant-1',
          quantity: 2,
          properties: { customText: 'Test text 1', slot: '1' }
        },
        {
          id: 'variant-2',
          quantity: 1,
          properties: { customText: 'Test text 2', slot: '2' }
        }
      ]
    })

    expect(result.current.success).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('filters out invalid products', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    const mockProducts: ConfiguredProduct[] = [
      {
        variantId: 'variant-1',
        quantity: 2,
        properties: { customText: 'Valid product', slot: '1' }
      },
      {
        variantId: '', // Invalid - no variant ID
        quantity: 1,
        properties: { customText: 'Invalid product', slot: '2' }
      },
      {
        variantId: 'variant-3',
        quantity: 1,
        properties: { customText: 'Another valid product', slot: '3' }
      }
    ]

    let response
    await act(async () => {
      response = await result.current.addMultipleToCart(mockProducts)
    })

    // Should only process valid products
    expect(response).toEqual({
      success: true,
      items: [
        {
          id: 'variant-1',
          quantity: 2,
          properties: { customText: 'Valid product', slot: '1' }
        },
        {
          id: 'variant-3',
          quantity: 1,
          properties: { customText: 'Another valid product', slot: '3' }
        }
      ]
    })
  })

  it('returns appropriate error messages', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    // Test with no valid products
    const emptyProducts: ConfiguredProduct[] = [
      {
        variantId: '', // Invalid
        quantity: 1,
        properties: { customText: 'No variant', slot: '1' }
      }
    ]

    let response
    await act(async () => {
      response = await result.current.addMultipleToCart(emptyProducts)
    })

    expect(response).toEqual({
      success: false,
      error: 'No valid products to add to cart'
    })

    expect(result.current.error).toBe('No valid products to add to cart')
    expect(result.current.success).toBe(false)
  })

  it('resets state correctly', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    const mockProducts: ConfiguredProduct[] = [
      {
        variantId: 'variant-1',
        quantity: 1,
        properties: { customText: 'Test', slot: '1' }
      }
    ]

    // Add products to create some state
    await act(async () => {
      await result.current.addMultipleToCart(mockProducts)
    })

    expect(result.current.success).toBe(true)

    // Reset state
    act(() => {
      result.current.reset()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.success).toBe(false)
  })

  it('handles empty product list', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    let response
    await act(async () => {
      response = await result.current.addMultipleToCart([])
    })

    expect(response).toEqual({
      success: false,
      error: 'No valid products to add to cart'
    })

    expect(result.current.error).toBe('No valid products to add to cart')
    expect(result.current.success).toBe(false)
  })

  it('maintains proper state during multiple calls', async () => {
    const { result } = renderHook(() => useMultiCart())
    
    const mockProducts: ConfiguredProduct[] = [
      {
        variantId: 'variant-1',
        quantity: 1,
        properties: { customText: 'Test', slot: '1' }
      }
    ]

    // First call
    await act(async () => {
      await result.current.addMultipleToCart(mockProducts)
    })

    expect(result.current.success).toBe(true)
    expect(result.current.error).toBe(null)

    // Reset
    act(() => {
      result.current.reset()
    })

    // Second call
    await act(async () => {
      await result.current.addMultipleToCart(mockProducts)
    })

    expect(result.current.success).toBe(true)
    expect(result.current.error).toBe(null)
  })
})

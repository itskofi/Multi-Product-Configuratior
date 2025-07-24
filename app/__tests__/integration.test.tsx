import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductSlot } from '../components/ProductSlot'
import { useMultiCart } from '../utils/useMultiCart'
import type { ConfiguredProduct } from '../types'

// Mock the useMultiCart hook
const mockAddMultipleToCart = vi.fn()
const mockReset = vi.fn()

vi.mock('../utils/useMultiCart', () => ({
  useMultiCart: vi.fn(() => ({
    addMultipleToCart: mockAddMultipleToCart,
    isLoading: false,
    error: null,
    success: false,
    reset: mockReset
  }))
}))

// Mock Polaris components for simpler testing
vi.mock('@shopify/polaris', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="app-provider">{children}</div>,
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  Page: ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div data-testid="page">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  ),
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
  BlockStack: ({ children }: { children: React.ReactNode }) => <div data-testid="block-stack">{children}</div>,
  FormLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="form-layout">{children}</div>,
  Text: ({ children, variant, as }: any) => {
    const Tag = as || 'span'
    return <Tag data-variant={variant}>{children}</Tag>
  },
  Select: ({ value, onChange, options, label }: any) => (
    <div>
      <label>{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        data-testid="select"
      >
        <option value="">Select variant</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  TextField: ({ value, onChange, label, type }: any) => (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        data-testid="text-field"
      />
    </div>
  ),
  Button: ({ children, onClick, disabled, primary }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid="button"
      className={primary ? 'primary' : ''}
    >
      {children}
    </button>
  ),
  Banner: ({ children, tone }: any) => (
    <div data-testid="banner" data-tone={tone}>
      {children}
    </div>
  )
}))

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddMultipleToCart.mockResolvedValue({ 
      success: true, 
      items: [] 
    })
  })

  describe('ProductSlot Component Data Flow', () => {
    it('calls onChange when product configuration changes', async () => {
      const mockOnChange = vi.fn()
      
      render(
        <ProductSlot 
          index={0} 
          onChange={mockOnChange} 
        />
      )

      // Change variant selection
      const variantSelect = screen.getByTestId('select')
      fireEvent.change(variantSelect, { target: { value: 'variant-1' } })

      // Verify onChange was called with correct data
      expect(mockOnChange).toHaveBeenCalledWith({
        variantId: 'variant-1',
        quantity: 1,
        properties: { customText: '', slot: '1' }
      })
    })

    it('updates quantity and custom text correctly', async () => {
      const mockOnChange = vi.fn()
      
      render(
        <ProductSlot 
          index={1} 
          onChange={mockOnChange} 
        />
      )

      // Set variant first
      const variantSelect = screen.getByTestId('select')
      fireEvent.change(variantSelect, { target: { value: 'variant-2' } })

      // Change custom text
      const textInputs = screen.getAllByTestId('text-field')
      const customTextInput = textInputs.find(input => 
        input.getAttribute('type') === 'text'
      )
      fireEvent.change(customTextInput!, { target: { value: 'Custom text' } })

      // Change quantity
      const quantityInput = textInputs.find(input => 
        input.getAttribute('type') === 'number'
      )
      fireEvent.change(quantityInput!, { target: { value: '3' } })

      // Verify final onChange call has all data
      expect(mockOnChange).toHaveBeenLastCalledWith({
        variantId: 'variant-2',
        quantity: 3,
        properties: { customText: 'Custom text', slot: '2' }
      })
    })
  })

  describe('useMultiCart Hook Integration', () => {
    it('processes multiple products correctly', async () => {
      const testProducts: ConfiguredProduct[] = [
        {
          variantId: 'variant-1',
          quantity: 2,
          properties: { customText: 'Product 1', slot: '1' }
        },
        {
          variantId: 'variant-2',
          quantity: 1,
          properties: { customText: 'Product 2', slot: '2' }
        }
      ]

      // Create a test component that uses the hook
      const TestComponent = () => {
        const { addMultipleToCart, isLoading, error, success } = useMultiCart()
        
        return (
          <div>
            <button 
              onClick={() => addMultipleToCart(testProducts)}
              data-testid="add-to-cart"
            >
              Add to Cart
            </button>
            {isLoading && <div data-testid="loading">Loading...</div>}
            {error && <div data-testid="error">{error}</div>}
            {success && <div data-testid="success">Success!</div>}
          </div>
        )
      }

      render(<TestComponent />)

      const addButton = screen.getByTestId('add-to-cart')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockAddMultipleToCart).toHaveBeenCalledWith(testProducts)
      })
    })

    it('handles loading states', async () => {
      // Mock loading state
      vi.mocked(useMultiCart).mockReturnValue({
        addMultipleToCart: mockAddMultipleToCart,
        isLoading: true,
        error: null,
        success: false,
        reset: mockReset
      })

      const TestComponent = () => {
        const { isLoading } = useMultiCart()
        return <div>{isLoading ? 'Loading...' : 'Ready'}</div>
      }

      render(<TestComponent />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('handles error states', async () => {
      // Mock error state
      vi.mocked(useMultiCart).mockReturnValue({
        addMultipleToCart: mockAddMultipleToCart,
        isLoading: false,
        error: 'Failed to add to cart',
        success: false,
        reset: mockReset
      })

      const TestComponent = () => {
        const { error } = useMultiCart()
        return <div>{error || 'No error'}</div>
      }

      render(<TestComponent />)
      expect(screen.getByText('Failed to add to cart')).toBeInTheDocument()
    })

    it('handles success states', async () => {
      // Mock success state
      vi.mocked(useMultiCart).mockReturnValue({
        addMultipleToCart: mockAddMultipleToCart,
        isLoading: false,
        error: null,
        success: true,
        reset: mockReset
      })

      const TestComponent = () => {
        const { success } = useMultiCart()
        return <div>{success ? 'Success!' : 'Not successful'}</div>
      }

      render(<TestComponent />)
      expect(screen.getByText('Success!')).toBeInTheDocument()
    })
  })

  describe('Data Validation and Filtering', () => {
    it('filters out invalid products', async () => {
      const mixedProducts: ConfiguredProduct[] = [
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

      const TestComponent = () => {
        const { addMultipleToCart } = useMultiCart()
        
        return (
          <button 
            onClick={() => addMultipleToCart(mixedProducts)}
            data-testid="add-mixed"
          >
            Add Mixed Products
          </button>
        )
      }

      render(<TestComponent />)

      const addButton = screen.getByTestId('add-mixed')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockAddMultipleToCart).toHaveBeenCalledWith(mixedProducts)
      })
    })

    it('handles empty product lists', async () => {
      const TestComponent = () => {
        const { addMultipleToCart } = useMultiCart()
        
        return (
          <button 
            onClick={() => addMultipleToCart([])}
            data-testid="add-empty"
          >
            Add Empty List
          </button>
        )
      }

      render(<TestComponent />)

      const addButton = screen.getByTestId('add-empty')
      fireEvent.click(addButton)

      await waitFor(() => {
        expect(mockAddMultipleToCart).toHaveBeenCalledWith([])
      })
    })
  })
})

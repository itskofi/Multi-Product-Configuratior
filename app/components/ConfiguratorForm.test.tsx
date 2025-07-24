import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfiguratorForm } from '../components/ConfiguratorForm'

// Mock the ProductSlot component
vi.mock('../components/ProductSlot', () => ({
  ProductSlot: ({ index, onChange }: { index: number; onChange: Function }) => (
    <div data-testid={`product-slot-${index}`}>
      <span>Product Slot {index + 1}</span>
      <button 
        onClick={() => onChange({
          variantId: `variant-${index}`,
          quantity: 1,
          properties: { customText: `text-${index}`, slot: `${index + 1}` }
        })}
        data-testid={`slot-${index}-trigger`}
      >
        Configure Product {index + 1}
      </button>
    </div>
  )
}))

// Mock the useMultiCart hook
const mockAddMultipleToCart = vi.fn()
const mockReset = vi.fn()

vi.mock('../utils/useMultiCart', () => ({
  useMultiCart: () => ({
    addMultipleToCart: mockAddMultipleToCart,
    isLoading: false,
    error: null,
    success: false,
    reset: mockReset,
  })
}))

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Page: ({ children, title, subtitle }: any) => (
    <div data-testid="page">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
  Layout: Object.assign(
    ({ children }: any) => <div data-testid="layout">{children}</div>,
    {
      Section: ({ children }: any) => <div data-testid="layout-section">{children}</div>
    }
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  BlockStack: ({ children }: any) => <div data-testid="block-stack">{children}</div>,
  Button: ({ children, onClick, disabled, loading, variant, size }: any) => (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      data-testid="submit-button"
      data-variant={variant}
      data-size={size}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  Text: ({ children, variant, as }: any) => {
    const Tag = as || 'span'
    return <Tag data-variant={variant}>{children}</Tag>
  },
  Banner: ({ title, children, tone, onDismiss }: any) => (
    <div data-testid="banner" data-tone={tone}>
      <h3>{title}</h3>
      <p>{children}</p>
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  ),
}))

describe('ConfiguratorForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddMultipleToCart.mockResolvedValue({ success: true })
  })

  it('renders 3 ProductSlot components', () => {
    render(<ConfiguratorForm />)
    
    expect(screen.getByText('Multi-Product Configurator')).toBeInTheDocument()
    expect(screen.getByTestId('product-slot-0')).toBeInTheDocument()
    expect(screen.getByTestId('product-slot-1')).toBeInTheDocument()
    expect(screen.getByTestId('product-slot-2')).toBeInTheDocument()
    expect(screen.getByText('Product Slot 1')).toBeInTheDocument()
    expect(screen.getByText('Product Slot 2')).toBeInTheDocument()
    expect(screen.getByText('Product Slot 3')).toBeInTheDocument()
  })

  it('manages product slots state correctly', async () => {
    const user = userEvent.setup()
    render(<ConfiguratorForm />)
    
    // Initially should show no valid products message
    expect(screen.getByText('Configure at least one product to continue')).toBeInTheDocument()
    
    // Configure first slot
    await user.click(screen.getByTestId('slot-0-trigger'))
    
    // Should now show ready message with 1 product
    expect(screen.getByText('Ready to add 1 product(s) to cart')).toBeInTheDocument()
    
    // Configure second slot
    await user.click(screen.getByTestId('slot-1-trigger'))
    
    // Should now show ready message with 2 products
    expect(screen.getByText('Ready to add 2 product(s) to cart')).toBeInTheDocument()
  })

  it('shows/hides submit button based on valid products', async () => {
    const user = userEvent.setup()
    render(<ConfiguratorForm />)
    
    const submitButton = screen.getByTestId('submit-button')
    
    // Initially disabled (no products configured)
    expect(submitButton).toBeDisabled()
    
    // Configure first slot
    await user.click(screen.getByTestId('slot-0-trigger'))
    
    // Should now be enabled
    expect(submitButton).not.toBeDisabled()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    render(<ConfiguratorForm />)
    
    // Configure some slots
    await user.click(screen.getByTestId('slot-0-trigger'))
    await user.click(screen.getByTestId('slot-2-trigger'))
    
    // Submit form
    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)
    
    // Should call addMultipleToCart with valid products
    expect(mockAddMultipleToCart).toHaveBeenCalledWith([
      {
        variantId: 'variant-0',
        quantity: 1,
        properties: { customText: 'text-0', slot: '1' }
      },
      {
        variantId: 'variant-2',
        quantity: 1,
        properties: { customText: 'text-2', slot: '3' }
      }
    ])
  })

  it('displays correct page title and subtitle', () => {
    render(<ConfiguratorForm />)
    
    expect(screen.getByText('Multi-Product Configurator')).toBeInTheDocument()
    expect(screen.getByText('Configure up to 3 products and add them to cart simultaneously')).toBeInTheDocument()
  })

  it('shows correct button text and properties', () => {
    render(<ConfiguratorForm />)
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toHaveAttribute('data-variant', 'primary')
    expect(submitButton).toHaveAttribute('data-size', 'large')
    expect(submitButton).toHaveTextContent('Add All to Cart')
  })

  it('filters out empty slots when submitting', async () => {
    const user = userEvent.setup()
    render(<ConfiguratorForm />)
    
    // Configure only first slot
    await user.click(screen.getByTestId('slot-0-trigger'))
    
    // Submit form
    await user.click(screen.getByTestId('submit-button'))
    
    // Should only send the configured slot, not empty ones
    expect(mockAddMultipleToCart).toHaveBeenCalledWith([
      {
        variantId: 'variant-0',
        quantity: 1,
        properties: { customText: 'text-0', slot: '1' }
      }
    ])
  })
})

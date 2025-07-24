import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductSlot } from '../components/ProductSlot'
import type { ConfiguredProduct } from '../types'

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  FormLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="form-layout">{children}</div>,
  Select: ({ label, value, onChange, options }: any) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <select 
        id={label} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
  TextField: ({ label, value, onChange, type = 'text', min }: any) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        min={min}
      />
    </div>
  ),
  BlockStack: ({ children }: { children: React.ReactNode }) => <div data-testid="block-stack">{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

describe('ProductSlot Component', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    index: 0,
    onChange: mockOnChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<ProductSlot {...defaultProps} />)
    
    expect(screen.getByText('Product Slot 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Product Variant')).toBeInTheDocument()
    expect(screen.getByLabelText('Custom Text')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    
    // Check initial values
    expect(screen.getByDisplayValue('')).toBeInTheDocument() // Custom text field
    expect(screen.getByDisplayValue('1')).toBeInTheDocument() // Quantity field
  })

  it('displays correct slot number', () => {
    render(<ProductSlot {...defaultProps} index={2} />)
    expect(screen.getByText('Product Slot 3')).toBeInTheDocument()
  })

  it('handles variant selection changes', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    const variantSelect = screen.getByLabelText('Product Variant')
    await user.selectOptions(variantSelect, 'variant-1')
    
    expect(mockOnChange).toHaveBeenCalledWith({
      variantId: 'variant-1',
      quantity: 1,
      properties: {
        customText: '',
        slot: '1',
      },
    })
  })

  it('handles custom text input changes', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    // First select a variant
    const variantSelect = screen.getByLabelText('Product Variant')
    await user.selectOptions(variantSelect, 'variant-1')
    
    // Then change custom text
    const textInput = screen.getByLabelText('Custom Text')
    await user.type(textInput, 'Test custom text')
    
    expect(mockOnChange).toHaveBeenLastCalledWith({
      variantId: 'variant-1',
      quantity: 1,
      properties: {
        customText: 'Test custom text',
        slot: '1',
      },
    })
  })

  it('handles quantity input changes', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    // First select a variant
    const variantSelect = screen.getByLabelText('Product Variant')
    await user.selectOptions(variantSelect, 'variant-1')
    
    // Clear the initial call from variant selection
    mockOnChange.mockClear()
    
    // Change quantity by directly setting value
    const quantityInput = screen.getByLabelText('Quantity')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    // Check the call made
    expect(mockOnChange).toHaveBeenCalledWith({
      variantId: 'variant-1',
      quantity: 3,
      properties: {
        customText: '',
        slot: '1',
      },
    })
  })

  it('calls onChange with correct ConfiguredProduct data', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    // Select variant
    const variantSelect = screen.getByLabelText('Product Variant')
    await user.selectOptions(variantSelect, 'variant-2')
    
    // Add custom text
    const textInput = screen.getByLabelText('Custom Text')
    await user.type(textInput, 'My custom text')
    
    // Clear previous calls and change quantity
    mockOnChange.mockClear()
    const quantityInput = screen.getByLabelText('Quantity')
    fireEvent.change(quantityInput, { target: { value: '5' } })
    
    // Check the call
    expect(mockOnChange).toHaveBeenCalledWith({
      variantId: 'variant-2',
      quantity: 5,
      properties: {
        customText: 'My custom text',
        slot: '1',
      },
    })
  })

  it('validates required props', () => {
    // Test that component renders without crashing when required props are provided
    expect(() => {
      render(<ProductSlot index={0} onChange={vi.fn()} />)
    }).not.toThrow()
  })

  it('handles invalid quantity input gracefully', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    // First select a variant
    const variantSelect = screen.getByLabelText('Product Variant')
    await user.selectOptions(variantSelect, 'variant-1')
    
    // Clear previous calls
    mockOnChange.mockClear()
    
    // Try to enter invalid quantity (0)
    const quantityInput = screen.getByLabelText('Quantity')
    fireEvent.change(quantityInput, { target: { value: '0' } })
    
    // Should default to 1 when 0 is entered
    expect(mockOnChange).toHaveBeenCalledWith({
      variantId: 'variant-1',
      quantity: 1,
      properties: {
        customText: '',
        slot: '1',
      },
    })
  })

  it('does not call onChange when no variant is selected', async () => {
    const user = userEvent.setup()
    render(<ProductSlot {...defaultProps} />)
    
    // Try to change text without selecting variant
    const textInput = screen.getByLabelText('Custom Text')
    await user.type(textInput, 'Test text')
    
    // onChange should not be called
    expect(mockOnChange).not.toHaveBeenCalled()
  })
})

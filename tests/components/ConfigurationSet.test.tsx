import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigurationSet } from '../../app/components/ConfigurationSet';
import type { ConfigurationSet as ConfigurationSetType } from '../../app/types';

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  TextField: ({ value, onChange, label, placeholder }: any) => (
    <input
      data-testid={`textfield-${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children }: any) => <div data-testid="inlinestack">{children}</div>,
  Divider: () => <hr data-testid="divider" />,
}));

// Mock ProductSlot component
vi.mock('../ProductSlot', () => ({
  ProductSlot: ({ index, onChange, product }: any) => (
    <div data-testid={`product-slot-${index}`}>
      <input
        data-testid={`product-slot-${index}-variant`}
        value={product?.variantId || ''}
        onChange={(e) => onChange?.({
          variantId: e.target.value,
          quantity: 1,
          properties: {},
          productId: 'test-product',
          title: 'Test Product',
          price: 50,
        })}
      />
    </div>
  ),
}));

describe('ConfigurationSet', () => {
  const mockSet: ConfigurationSetType = {
    id: 'test-set-1',
    name: 'Test Configuration',
    products: [
      {
        variantId: 'variant-1',
        quantity: 1,
        properties: { customText: 'Test text' },
        productId: 'product-1',
        title: 'Test Product 1',
        price: 50,
      },
    ],
    createdAt: new Date('2025-01-01'),
  };

  const mockProps = {
    set: mockSet,
    onUpdateSet: vi.fn(),
    onAddProduct: vi.fn(),
    onRemoveProduct: vi.fn(),
    onUpdateProduct: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders configuration set with correct title', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    expect(screen.getByDisplayValue('Test Configuration')).toBeInTheDocument();
  });

  it('renders existing products in product slots', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    expect(screen.getByTestId('product-slot-0')).toBeInTheDocument();
    expect(screen.getByTestId('product-slot-0-variant')).toHaveValue('variant-1');
  });

  it('allows renaming the configuration set', async () => {
    render(<ConfigurationSet {...mockProps} />);
    
    const nameInput = screen.getByDisplayValue('Test Configuration');
    fireEvent.change(nameInput, { target: { value: 'New Configuration Name' } });
    
    await waitFor(() => {
      expect(mockProps.onUpdateSet).toHaveBeenCalledWith({
        name: 'New Configuration Name',
      });
    });
  });

  it('adds new product slot when add button is clicked', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddProduct).toHaveBeenCalledWith({
      variantId: '',
      quantity: 1,
      properties: {},
      productId: '',
      title: '',
      price: 0,
    });
  });

  it('removes product when remove button is clicked', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    expect(mockProps.onRemoveProduct).toHaveBeenCalledWith(0);
  });

  it('updates product when product slot changes', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    const variantInput = screen.getByTestId('product-slot-0-variant');
    fireEvent.change(variantInput, { target: { value: 'new-variant-id' } });
    
    expect(mockProps.onUpdateProduct).toHaveBeenCalledWith(0, {
      variantId: 'new-variant-id',
      quantity: 1,
      properties: {},
      productId: 'test-product',
      title: 'Test Product',
      price: 50,
    });
  });

  it('disables add button when maximum products reached', () => {
    const setWithMaxProducts = {
      ...mockSet,
      products: new Array(5).fill(null).map((_, index) => ({
        variantId: `variant-${index}`,
        quantity: 1,
        properties: {},
        productId: `product-${index}`,
        title: `Product ${index}`,
        price: 50,
      })),
    };

    render(<ConfigurationSet {...mockProps} set={setWithMaxProducts} />);
    
    const addButton = screen.getByText('Add Product');
    expect(addButton).toBeDisabled();
  });

  it('renders empty state when no products', () => {
    const emptySet = { ...mockSet, products: [] };
    
    render(<ConfigurationSet {...mockProps} set={emptySet} />);
    
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('displays configuration creation date', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('handles configuration name validation', async () => {
    render(<ConfigurationSet {...mockProps} />);
    
    const nameInput = screen.getByDisplayValue('Test Configuration');
    
    // Test empty name
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);
    
    await waitFor(() => {
      expect(mockProps.onUpdateSet).not.toHaveBeenCalled();
    });
  });

  it('renders product count correctly', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    expect(screen.getByText(/1 product/)).toBeInTheDocument();
  });

  it('handles multiple product removal correctly', () => {
    const setWithMultipleProducts = {
      ...mockSet,
      products: [
        {
          variantId: 'variant-1',
          quantity: 1,
          properties: {},
          productId: 'product-1',
          title: 'Product 1',
          price: 50,
        },
        {
          variantId: 'variant-2',
          quantity: 2,
          properties: {},
          productId: 'product-2',
          title: 'Product 2',
          price: 75,
        },
      ],
    };

    render(<ConfigurationSet {...mockProps} set={setWithMultipleProducts} />);
    
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[1]); // Remove second product
    
    expect(mockProps.onRemoveProduct).toHaveBeenCalledWith(1);
  });

  it('calculates total price correctly', () => {
    const setWithMultipleProducts = {
      ...mockSet,
      products: [
        {
          variantId: 'variant-1',
          quantity: 2,
          properties: {},
          productId: 'product-1',
          title: 'Product 1',
          price: 50,
        },
        {
          variantId: 'variant-2',
          quantity: 1,
          properties: {},
          productId: 'product-2',
          title: 'Product 2',
          price: 30,
        },
      ],
    };

    render(<ConfigurationSet {...mockProps} set={setWithMultipleProducts} />);
    
    // Total should be (2 * 50) + (1 * 30) = 130
    expect(screen.getByText(/\$130/)).toBeInTheDocument();
  });

  it('renders product summary correctly', () => {
    render(<ConfigurationSet {...mockProps} />);
    
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });
});

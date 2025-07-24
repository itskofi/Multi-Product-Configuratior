import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductPreview } from '../../app/components/ProductPreview';
import type { ConfiguredProduct } from '../../app/types';

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children, variant, as, tone, alignment, fontWeight }: any) => (
    <div 
      data-testid={`text-${variant || 'default'}`}
      data-tone={tone}
      data-alignment={alignment}
      data-font-weight={fontWeight}
    >
      {children}
    </div>
  ),
  Button: ({ children, onClick, disabled, variant, size, tone, accessibilityLabel }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      data-tone={tone}
      aria-label={accessibilityLabel}
    >
      {children}
    </button>
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children, align, blockAlign }: any) => (
    <div data-testid="inlinestack" data-align={align} data-block-align={blockAlign}>
      {children}
    </div>
  ),
  Box: ({ children, padding, background }: any) => (
    <div data-testid="box" data-padding={padding} data-background={background}>
      {children}
    </div>
  ),
  Divider: () => <hr data-testid="divider" />,
}));

describe('ProductPreview', () => {
  const mockProducts: ConfiguredProduct[] = [
    {
      variantId: 'variant-1',
      quantity: 2,
      properties: { 
        customText: 'Happy Anniversary',
        engraving: 'A & B'
      },
      productId: 'ring-1',
      title: 'Diamond Ring',
      price: 1500,
      image: 'https://example.com/ring.jpg'
    },
    {
      variantId: 'variant-2',
      quantity: 1,
      properties: {},
      productId: 'necklace-1',
      title: 'Gold Necklace',
      price: 800,
    },
    {
      variantId: 'variant-3',
      quantity: 3,
      properties: { 
        size: 'Medium',
        color: 'Silver'
      },
      title: 'Silver Bracelet',
      price: 250,
    }
  ];

  const defaultProps = {
    products: mockProducts,
    onRemoveProduct: vi.fn(),
    title: 'My Configuration Preview'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no products provided', () => {
    render(
      <ProductPreview
        products={[]}
        onRemoveProduct={vi.fn()}
        title="Empty Preview"
      />
    );

    expect(screen.getByText('Empty Preview')).toBeInTheDocument();
    expect(screen.getByText('No products configured yet. Start by selecting products in your configuration sets.')).toBeInTheDocument();
  });

  it('renders product preview with custom title', () => {
    render(<ProductPreview {...defaultProps} />);

    expect(screen.getByText('My Configuration Preview')).toBeInTheDocument();
  });

  it('uses default title when none provided', () => {
    render(
      <ProductPreview
        products={mockProducts}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.getByText('Product Preview')).toBeInTheDocument();
  });

  it('displays correct product count and total items', () => {
    render(<ProductPreview {...defaultProps} />);

    // 3 products, total 6 items (2 + 1 + 3)
    expect(screen.getByText('3 products • 6 items')).toBeInTheDocument();
  });

  it('calculates and displays correct total price', () => {
    render(<ProductPreview {...defaultProps} />);

    // Total: (1500 * 2) + (800 * 1) + (250 * 3) = 3000 + 800 + 750 = 4550
    expect(screen.getByText('Total: $4550.00')).toBeInTheDocument();
    expect(screen.getByText('6 items total')).toBeInTheDocument();
  });

  it('renders all product cards', () => {
    render(<ProductPreview {...defaultProps} />);

    expect(screen.getByText('Diamond Ring')).toBeInTheDocument();
    expect(screen.getByText('Gold Necklace')).toBeInTheDocument();
    expect(screen.getByText('Silver Bracelet')).toBeInTheDocument();
  });

  it('displays product details correctly', () => {
    render(<ProductPreview {...defaultProps} />);

    // Check variant IDs
    expect(screen.getByText('Variant ID: variant-1')).toBeInTheDocument();
    expect(screen.getByText('Variant ID: variant-2')).toBeInTheDocument();
    expect(screen.getByText('Variant ID: variant-3')).toBeInTheDocument();

    // Check prices (may appear multiple times for unit price and subtotal)
    expect(screen.getAllByText('$1500.00')).toHaveLength(1); // Unit price appears once
    expect(screen.getAllByText('$800.00')).toHaveLength(2); // Unit price and subtotal are same
    expect(screen.getAllByText('$250.00')).toHaveLength(1);

    // Check quantities
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calculates subtotals correctly for each product', () => {
    render(<ProductPreview {...defaultProps} />);

    // Subtotals: 1500*2=3000, 800*1=800, 250*3=750
    expect(screen.getAllByText('$3000.00')).toHaveLength(1);
    expect(screen.getAllByText('$800.00')).toHaveLength(2); // Unit price and subtotal are same
    expect(screen.getAllByText('$750.00')).toHaveLength(1);
  });

  it('displays custom properties when present', () => {
    render(<ProductPreview {...defaultProps} />);

    // Diamond Ring properties
    expect(screen.getByText('customText:')).toBeInTheDocument();
    expect(screen.getByText('Happy Anniversary')).toBeInTheDocument();
    expect(screen.getByText('engraving:')).toBeInTheDocument();
    expect(screen.getByText('A & B')).toBeInTheDocument();

    // Silver Bracelet properties
    expect(screen.getByText('size:')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('color:')).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
  });

  it('does not show customizations section when no properties', () => {
    const productsWithoutProperties = [
      {
        variantId: 'variant-1',
        quantity: 1,
        properties: {},
        title: 'Simple Ring',
        price: 100,
      }
    ];

    render(
      <ProductPreview
        products={productsWithoutProperties}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.queryByText('Customizations:')).not.toBeInTheDocument();
  });

  it('displays product image when available', () => {
    render(<ProductPreview {...defaultProps} />);

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'https://example.com/ring.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Diamond Ring');
  });

  it('shows placeholder when no image available', () => {
    render(<ProductPreview {...defaultProps} />);

    // Products without images should show "No image" placeholder
    expect(screen.getAllByText('No image')).toHaveLength(2); // Gold Necklace and Silver Bracelet
  });

  it('calls onRemoveProduct when remove button clicked', () => {
    render(<ProductPreview {...defaultProps} />);

    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons).toHaveLength(3);

    fireEvent.click(removeButtons[1]);
    expect(defaultProps.onRemoveProduct).toHaveBeenCalledWith(1);
  });

  it('has correct accessibility labels for remove buttons', () => {
    render(<ProductPreview {...defaultProps} />);

    expect(screen.getByLabelText('Remove Diamond Ring')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Gold Necklace')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Silver Bracelet')).toBeInTheDocument();
  });

  it('handles products without titles gracefully', () => {
    const productsWithoutTitles = [
      {
        variantId: 'variant-1',
        quantity: 1,
        properties: {},
        price: 100,
      }
    ];

    render(
      <ProductPreview
        products={productsWithoutTitles}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove product')).toBeInTheDocument();
  });

  it('handles products without prices gracefully', () => {
    const productsWithoutPrices = [
      {
        variantId: 'variant-1',
        quantity: 2,
        properties: {},
        title: 'Free Sample',
      }
    ];

    render(
      <ProductPreview
        products={productsWithoutPrices}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.getAllByText('$0.00')).toHaveLength(2); // Unit price and subtotal for products without prices
    expect(screen.getByText('Total: $0.00')).toBeInTheDocument();
  });

  it('handles single vs plural product text correctly', () => {
    const singleProduct = [mockProducts[0]];

    render(
      <ProductPreview
        products={singleProduct}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.getByText('1 product • 2 items')).toBeInTheDocument();
  });

  it('displays products in a grid layout', () => {
    render(<ProductPreview {...defaultProps} />);

    // The grid container should be present (this would be more thorough with actual DOM testing)
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(3); // Main card + product cards
  });

  it('shows dividers in appropriate places', () => {
    render(<ProductPreview {...defaultProps} />);

    const dividers = screen.getAllByTestId('divider');
    expect(dividers.length).toBeGreaterThanOrEqual(2); // At least header divider and summary divider
  });

  it('handles large quantities correctly', () => {
    const productsWithLargeQuantity = [
      {
        variantId: 'variant-bulk',
        quantity: 100,
        properties: {},
        title: 'Bulk Order',
        price: 5,
      }
    ];

    render(
      <ProductPreview
        products={productsWithLargeQuantity}
        onRemoveProduct={vi.fn()}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument(); // Quantity
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // Subtotal (5 * 100)
    expect(screen.getByText('Total: $500.00')).toBeInTheDocument();
  });

  it('maintains proper spacing and structure', () => {
    render(<ProductPreview {...defaultProps} />);

    // Check that BlockStack and InlineStack components are rendered with proper attributes
    const blockStacks = screen.getAllByTestId('blockstack');
    const inlineStacks = screen.getAllByTestId('inlinestack');
    
    expect(blockStacks.length).toBeGreaterThan(0);
    expect(inlineStacks.length).toBeGreaterThan(0);

    // Check alignment attributes
    const spaceBetweenStacks = screen.getAllByTestId('inlinestack').filter(
      element => element.getAttribute('data-align') === 'space-between'
    );
    expect(spaceBetweenStacks.length).toBeGreaterThan(0);
  });
});

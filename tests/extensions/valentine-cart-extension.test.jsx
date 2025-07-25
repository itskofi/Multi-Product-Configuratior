import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Shopify UI Extensions
const mockUseCartLines = vi.fn();
const mockUseApplyCartLinesChange = vi.fn();
const mockUseApi = vi.fn();

vi.mock('@shopify/ui-extensions-react/checkout', () => ({
  useExtensionApi: vi.fn(),
  render: vi.fn(),
  Banner: ({ children, status }) => <div data-testid={`banner-${status}`}>{children}</div>,
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  Text: ({ children, emphasis, size, appearance, tone }) => (
    <span 
      data-testid="text" 
      data-emphasis={emphasis}
      data-size={size}
      data-appearance={appearance}
      data-tone={tone}
    >
      {children}
    </span>
  ),
  Button: ({ children, onPress, kind, size, tone, disabled }) => (
    <button 
      data-testid="button"
      onClick={onPress}
      data-kind={kind}
      data-size={size}
      data-tone={tone}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  Divider: () => <hr data-testid="divider" />,
  InlineStack: ({ children }) => <div data-testid="inline-stack">{children}</div>,
  BlockStack: ({ children }) => <div data-testid="block-stack">{children}</div>,
  Badge: ({ children, tone }) => <span data-testid="badge" data-tone={tone}>{children}</span>,
  Icon: ({ source, size }) => <span data-testid="icon" data-source={source} data-size={size} />,
  Link: ({ children, url, external }) => (
    <a data-testid="link" href={url} data-external={external}>{children}</a>
  ),
  useCartLines: () => mockUseCartLines(),
  useApplyCartLinesChange: () => mockUseApplyCartLinesChange(),
  useApi: () => mockUseApi()
}));

// Import the component after mocking
import ValentineBundleDisplay from '../../extensions/valentine-cart-extension/src/index.jsx';

describe('Valentine Bundle Display Cart Extension', () => {
  const mockApplyCartLinesChange = vi.fn();
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApplyCartLinesChange.mockReturnValue(mockApplyCartLinesChange);
    mockUseApi.mockReturnValue({ query: mockQuery });
    
    // Mock window.open for edit bundle functionality
    Object.defineProperty(window, 'open', {
      value: vi.fn(),
      writable: true
    });
  });

  const createMockCartLine = (bundleId, bundleName, productTitle, price = 25.00, quantity = 1) => ({
    id: `line-${bundleId}-${productTitle.replace(/\s+/g, '-').toLowerCase()}`,
    quantity,
    cost: {
      totalAmount: {
        amount: price * quantity
      }
    },
    merchandise: {
      id: `variant-${productTitle.replace(/\s+/g, '-').toLowerCase()}`,
      title: 'Default Title',
      price: { amount: price },
      image: {
        url: `https://example.com/${productTitle.replace(/\s+/g, '-').toLowerCase()}.jpg`
      },
      product: {
        title: productTitle,
        id: `product-${productTitle.replace(/\s+/g, '-').toLowerCase()}`
      }
    },
    attributes: [
      { key: '_bundle_id', value: bundleId },
      { key: '_bundle_name', value: bundleName },
      { key: '_is_bundle_item', value: 'true' }
    ]
  });

  describe('Empty State', () => {
    it('should not render anything when no bundles are present', () => {
      mockUseCartLines.mockReturnValue([]);
      
      const { container } = render(<ValentineBundleDisplay />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render for regular cart items without bundle attributes', () => {
      const regularItem = {
        id: 'line-regular-item',
        quantity: 1,
        cost: { totalAmount: { amount: 15.00 } },
        merchandise: {
          id: 'variant-regular',
          title: 'Regular Product',
          product: { title: 'Regular Product', id: 'product-regular' }
        },
        attributes: []
      };

      mockUseCartLines.mockReturnValue([regularItem]);
      
      const { container } = render(<ValentineBundleDisplay />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Bundle Display', () => {
    it('should display Valentine bundle with basic information', () => {
      const bundleItems = [
        createMockCartLine('bundle-valentine-1', 'Romantic Evening Bundle', 'Red Roses Bouquet', 35.00),
        createMockCartLine('bundle-valentine-1', 'Romantic Evening Bundle', 'Chocolate Box', 20.00),
        createMockCartLine('bundle-valentine-1', 'Romantic Evening Bundle', 'Scented Candle', 15.00)
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('💕 Valentine\'s Day Bundles')).toBeInTheDocument();
      expect(screen.getByText('Romantic Evening Bundle')).toBeInTheDocument();
      expect(screen.getByText('3 items • Quantity: 1')).toBeInTheDocument();
      expect(screen.getByText('$70.00')).toBeInTheDocument();
    });

    it('should show bundle badge and bundle actions', () => {
      const bundleItems = [
        createMockCartLine('bundle-valentine-1', 'Love Package', 'Heart Necklace', 45.00)
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('Bundle')).toBeInTheDocument();
      expect(screen.getByText('Show Details')).toBeInTheDocument();
      expect(screen.getByText('Edit Bundle')).toBeInTheDocument();
      expect(screen.getByText('Remove Bundle')).toBeInTheDocument();
    });

    it('should display bundle with gift options', () => {
      const bundleItems = [
        {
          ...createMockCartLine('bundle-valentine-1', 'Luxury Bundle', 'Premium Gift', 100.00),
          attributes: [
            { key: '_bundle_id', value: 'bundle-valentine-1' },
            { key: '_bundle_name', value: 'Luxury Bundle' },
            { key: '_is_bundle_item', value: 'true' },
            { key: '_gift_wrapping', value: 'romantic-pink' },
            { key: '_gift_message', value: 'Happy Valentine\'s Day, my love!' }
          ]
        }
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('Gift Wrapping: Romantic Pink Hearts')).toBeInTheDocument();
      expect(screen.getByText('Gift Message: "Happy Valentine\'s Day, my love!"')).toBeInTheDocument();
    });

    it('should display discount code when applied', () => {
      const bundleItems = [
        {
          ...createMockCartLine('bundle-valentine-1', 'Discounted Bundle', 'Special Item', 50.00),
          attributes: [
            { key: '_bundle_id', value: 'bundle-valentine-1' },
            { key: '_bundle_name', value: 'Discounted Bundle' },
            { key: '_is_bundle_item', value: 'true' },
            { key: '_discount_code', value: 'VALENTINE20' }
          ]
        }
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('Discount Applied: VALENTINE20')).toBeInTheDocument();
    });
  });

  describe('Bundle Interactions', () => {
    beforeEach(() => {
      const bundleItems = [
        createMockCartLine('bundle-valentine-1', 'Test Bundle', 'Item 1', 25.00, 2),
        createMockCartLine('bundle-valentine-1', 'Test Bundle', 'Item 2', 35.00, 2)
      ];
      mockUseCartLines.mockReturnValue(bundleItems);
    });

    it('should expand and collapse bundle details', () => {
      render(<ValentineBundleDisplay />);
      
      const showDetailsButton = screen.getByText('Show Details');
      fireEvent.click(showDetailsButton);
      
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      expect(screen.getByText('Bundle Items:')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle quantity increase', async () => {
      render(<ValentineBundleDisplay />);
      
      const increaseButton = screen.getByText('+');
      fireEvent.click(increaseButton);
      
      await waitFor(() => {
        expect(mockApplyCartLinesChange).toHaveBeenCalledWith({
          type: 'updateCartLine',
          lines: [
            { id: 'line-bundle-valentine-1-item-1', quantity: 3 },
            { id: 'line-bundle-valentine-1-item-2', quantity: 3 }
          ]
        });
      });
    });

    it('should handle quantity decrease', async () => {
      render(<ValentineBundleDisplay />);
      
      const decreaseButton = screen.getByText('-');
      fireEvent.click(decreaseButton);
      
      await waitFor(() => {
        expect(mockApplyCartLinesChange).toHaveBeenCalledWith({
          type: 'updateCartLine',
          lines: [
            { id: 'line-bundle-valentine-1-item-1', quantity: 1 },
            { id: 'line-bundle-valentine-1-item-2', quantity: 1 }
          ]
        });
      });
    });

    it('should not allow quantity to go below 1', () => {
      // Set quantity to 1
      const bundleItems = [
        createMockCartLine('bundle-valentine-1', 'Test Bundle', 'Item 1', 25.00, 1)
      ];
      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      const decreaseButton = screen.getByText('-');
      expect(decreaseButton).toBeDisabled();
    });

    it('should remove entire bundle', async () => {
      render(<ValentineBundleDisplay />);
      
      const removeButton = screen.getByText('Remove Bundle');
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(mockApplyCartLinesChange).toHaveBeenCalledWith({
          type: 'updateCartLine',
          lines: [
            { id: 'line-bundle-valentine-1-item-1', quantity: 0 },
            { id: 'line-bundle-valentine-1-item-2', quantity: 0 }
          ]
        });
      });
    });

    it('should open configurator for bundle editing', () => {
      render(<ValentineBundleDisplay />);
      
      const editButton = screen.getByText('Edit Bundle');
      fireEvent.click(editButton);
      
      expect(window.open).toHaveBeenCalledWith(
        '/apps/multi-product-config?edit_bundle=bundle-valentine-1',
        '_blank'
      );
    });
  });

  describe('Multiple Bundles', () => {
    it('should display multiple bundles correctly', () => {
      const bundleItems = [
        createMockCartLine('bundle-1', 'Romantic Bundle', 'Roses', 30.00),
        createMockCartLine('bundle-1', 'Romantic Bundle', 'Chocolates', 20.00),
        createMockCartLine('bundle-2', 'Luxury Bundle', 'Premium Gift', 100.00)
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('Romantic Bundle')).toBeInTheDocument();
      expect(screen.getByText('Luxury Bundle')).toBeInTheDocument();
      expect(screen.getByText('🌹 Valentine\'s Bundle Summary')).toBeInTheDocument();
    });
  });

  describe('Bundle Summary', () => {
    it('should calculate and display bundle summary correctly', () => {
      const bundleItems = [
        createMockCartLine('bundle-1', 'Bundle 1', 'Item 1', 25.00),
        createMockCartLine('bundle-1', 'Bundle 1', 'Item 2', 35.00),
        createMockCartLine('bundle-2', 'Bundle 2', 'Item 3', 50.00)
      ];

      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByText('🌹 Valentine\'s Bundle Summary')).toBeInTheDocument();
      expect(screen.getByText('💕 Perfect for Valentine\'s Day! Your romantic bundles are ready for checkout.')).toBeInTheDocument();
      expect(screen.getByText('Create more Valentine\'s bundles')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle cart line analysis errors gracefully', () => {
      // Mock a scenario that would cause an error
      mockUseCartLines.mockReturnValue([
        {
          id: 'malformed-line',
          // Missing required properties to trigger error
        }
      ]);
      
      render(<ValentineBundleDisplay />);
      
      expect(screen.getByTestId('banner-critical')).toBeInTheDocument();
      expect(screen.getByText('Failed to analyze Valentine\'s bundles')).toBeInTheDocument();
    });

    it('should handle cart line change errors', async () => {
      mockApplyCartLinesChange.mockRejectedValue(new Error('API Error'));
      
      const bundleItems = [
        createMockCartLine('bundle-1', 'Test Bundle', 'Item 1', 25.00)
      ];
      mockUseCartLines.mockReturnValue(bundleItems);
      
      render(<ValentineBundleDisplay />);
      
      const removeButton = screen.getByText('Remove Bundle');
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to remove bundle. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Gift Wrapping Formatting', () => {
    it('should format gift wrapping styles correctly', () => {
      const testCases = [
        { input: 'classic-red', expected: 'Classic Red Ribbon' },
        { input: 'elegant-gold', expected: 'Elegant Gold Bow' },
        { input: 'romantic-pink', expected: 'Romantic Pink Hearts' },
        { input: 'premium-velvet', expected: 'Premium Velvet Box' },
        { input: 'unknown-style', expected: 'unknown-style' }
      ];

      testCases.forEach(({ input, expected }) => {
        const bundleItems = [
          {
            ...createMockCartLine('bundle-1', 'Test Bundle', 'Item', 25.00),
            attributes: [
              { key: '_bundle_id', value: 'bundle-1' },
              { key: '_bundle_name', value: 'Test Bundle' },
              { key: '_is_bundle_item', value: 'true' },
              { key: '_gift_wrapping', value: input }
            ]
          }
        ];

        mockUseCartLines.mockReturnValue(bundleItems);
        
        const { rerender } = render(<ValentineBundleDisplay />);
        
        expect(screen.getByText(`Gift Wrapping: ${expected}`)).toBeInTheDocument();
        
        rerender(<div />); // Clear for next test
      });
    });
  });
});

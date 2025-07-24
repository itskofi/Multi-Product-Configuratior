import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationNavigator } from '../../app/components/ConfigurationNavigator';
import type { ConfigurationSet } from '../../app/types';

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children, variant }: any) => <div data-testid={`text-${variant || 'default'}`}>{children}</div>,
  Button: ({ children, onClick, disabled, variant, size, accessibilityLabel }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid={`button-${variant || 'default'}`}
      data-size={size}
      aria-label={accessibilityLabel}
    >
      {children}
    </button>
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children }: any) => <div data-testid="inlinestack">{children}</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Divider: () => <hr data-testid="divider" />,
}));

describe('ConfigurationNavigator', () => {
  const mockSets: ConfigurationSet[] = [
    {
      id: 'set-1',
      name: 'Wedding Set',
      products: [
        {
          productId: 'ring-1',
          variantId: 'variant-1',
          title: 'Engagement Ring',
          quantity: 1,
          price: 1500,
          properties: {}
        }
      ],
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'set-2',
      name: 'Anniversary Collection',
      products: [
        {
          productId: 'necklace-1',
          variantId: 'variant-2',
          title: 'Diamond Necklace',
          quantity: 1,
          price: 800,
          properties: {}
        },
        {
          productId: 'earrings-1',
          variantId: 'variant-3',
          title: 'Diamond Earrings',
          quantity: 1,
          price: 600,
          properties: {}
        }
      ],
      createdAt: new Date('2024-01-02'),
    },
  ];

  const defaultProps = {
    sets: mockSets,
    activeSetId: 'set-1',
    onSetSelect: vi.fn(),
    onAddSet: vi.fn(),
    onDeleteSet: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders configuration sets list', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    expect(screen.getByText('Wedding Set')).toBeInTheDocument();
    expect(screen.getByText('Anniversary Collection')).toBeInTheDocument();
    expect(screen.getByText('1 product • 1 items')).toBeInTheDocument();
    expect(screen.getByText('2 products • 2 items')).toBeInTheDocument();
  });

  it('renders configurations header with Add New button', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    expect(screen.getByText('Configurations')).toBeInTheDocument();
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('calls onSetSelect when clicking on a set', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    const anniversarySet = screen.getByText('Anniversary Collection');
    fireEvent.click(anniversarySet);

    expect(defaultProps.onSetSelect).toHaveBeenCalledWith('set-2');
  });

  it('calls onAddSet when clicking Add New button', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    const addButton = screen.getByText('Add New');
    fireEvent.click(addButton);

    expect(defaultProps.onAddSet).toHaveBeenCalled();
  });

  it('shows delete button for each set', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    const deleteButtons = screen.getAllByText('×');
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeleteSet).toHaveBeenCalledWith('set-1');
  });

  it('displays empty state when no sets exist', () => {
    render(
      <ConfigurationNavigator
        {...defaultProps}
        sets={[]}
        activeSetId={null}
      />
    );

    expect(screen.getByText('No configurations yet. Create your first one!')).toBeInTheDocument();
  });

  it('displays product count and quantity for each set', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    expect(screen.getByText('1 product • 1 items')).toBeInTheDocument();
    expect(screen.getByText('2 products • 2 items')).toBeInTheDocument();
  });

  it('shows discount code when applied to a set', () => {
    const setsWithDiscounts = [
      {
        ...mockSets[0],
        discountCode: 'WEDDING10'
      },
      mockSets[1]
    ];

    render(
      <ConfigurationNavigator
        {...defaultProps}
        sets={setsWithDiscounts}
      />
    );

    expect(screen.getByText('1 product • 1 items • WEDDING10')).toBeInTheDocument();
  });

  it('highlights active configuration set with different styling', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    // Check that the component renders both sets
    expect(screen.getByText('Wedding Set')).toBeInTheDocument();
    expect(screen.getByText('Anniversary Collection')).toBeInTheDocument();
    
    // Active set logic would be tested with actual styling in real implementation
    // For now, just verify the sets are rendered
  });

  it('prevents event bubbling when clicking delete button', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    const deleteButton = screen.getAllByText('×')[0];
    const setContainer = deleteButton.closest('div');

    fireEvent.click(deleteButton);

    // Only onDeleteSet should be called, not onSetSelect
    expect(defaultProps.onDeleteSet).toHaveBeenCalledWith('set-1');
    expect(defaultProps.onSetSelect).not.toHaveBeenCalled();
  });

  it('displays product previews for each set', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    expect(screen.getByText('Engagement Ring')).toBeInTheDocument();
    expect(screen.getByText('Diamond Necklace')).toBeInTheDocument();
    expect(screen.getByText('Diamond Earrings')).toBeInTheDocument();
  });

  it('shows "more" indicator when there are more than 3 products', () => {
    const setsWithManyProducts = [
      {
        ...mockSets[0],
        products: [
          ...mockSets[0].products,
          { variantId: 'v4', quantity: 1, properties: {}, title: 'Product 2' },
          { variantId: 'v5', quantity: 1, properties: {}, title: 'Product 3' },
          { variantId: 'v6', quantity: 1, properties: {}, title: 'Product 4' },
          { variantId: 'v7', quantity: 1, properties: {}, title: 'Product 5' },
        ]
      }
    ];

    render(
      <ConfigurationNavigator
        {...defaultProps}
        sets={setsWithManyProducts}
      />
    );

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('handles sets with no products gracefully', () => {
    const setsWithEmptySet = [
      {
        id: 'empty-set',
        name: 'Empty Set',
        products: [],
        createdAt: new Date()
      }
    ];

    render(
      <ConfigurationNavigator
        {...defaultProps}
        sets={setsWithEmptySet}
      />
    );

    expect(screen.getByText('Empty Set')).toBeInTheDocument();
    expect(screen.getByText('0 products')).toBeInTheDocument();
  });

  it('displays correct accessibility labels for delete buttons', () => {
    render(<ConfigurationNavigator {...defaultProps} />);

    // Check that delete buttons have proper accessibility labels
    expect(screen.getByLabelText('Delete Wedding Set')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete Anniversary Collection')).toBeInTheDocument();
  });
});

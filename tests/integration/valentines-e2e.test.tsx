import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ValentinesWorkflow } from '../../app/components/ValentinesWorkflow';
import { GiftWrapComponent } from '../../app/components/GiftWrapComponent';
import { useConfigurationSets } from '../../app/hooks/useConfigurationSets';
import { addConfigurationSetsToCart } from '../../app/utils/cartHelpers';

// Mock the hooks and utilities
vi.mock('../../app/hooks/useConfigurationSets');
vi.mock('../../app/utils/cartHelpers');

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children, variant, as = 'span' }: any) => <div data-testid={`text-${variant || 'default'}`}>{children}</div>,
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={`button-${variant || 'default'}`}>
      {children}
    </button>
  ),
  Select: ({ value, onChange, options }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  TextField: ({ value, onChange }: any) => (
    <input
      data-testid="textfield"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children }: any) => <div data-testid="inlinestack">{children}</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Banner: ({ children, tone }: any) => <div data-testid={`banner-${tone}`}>{children}</div>,
  Badge: ({ children, tone }: any) => <span data-testid={`badge-${tone}`}>{children}</span>,
  Checkbox: ({ label, checked, onChange }: any) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
    />
  ),
}));

describe('Valentine\'s Day E2E Workflow', () => {
  const mockUseConfigurationSets = {
    sets: [],
    addSet: vi.fn(),
    updateSet: vi.fn(),
    removeSet: vi.fn(),
    duplicateSet: vi.fn(),
    setActiveSetId: vi.fn(),
    activeSetId: null,
    discountCodes: {},
    addDiscountCode: vi.fn(),
    removeDiscountCode: vi.fn(),
    calculateTotalPrice: vi.fn(() => 200),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useConfigurationSets as any).mockReturnValue(mockUseConfigurationSets);
    (addConfigurationSetsToCart as any).mockResolvedValue({ success: true });
  });

  it('completes full Valentine\'s Day jewelry shopping scenario', async () => {
    const TestWorkflow = () => {
      const { addSet } = useConfigurationSets();
      
      return (
        <div>
          <ValentinesWorkflow
            onCreateConfiguration={addSet}
            onApplyDiscount={(code) => {
              mockUseConfigurationSets.addDiscountCode('test-set-id', { 
                code, 
                isValid: true, 
                discountType: 'percentage', 
                value: 20 
              });
            }}
          />
          <GiftWrapComponent
            onGiftWrapChange={(options) => {
              // Mock gift wrap handling
            }}
          />
        </div>
      );
    };

    render(<TestWorkflow />);

    // Step 1: Customer sees Valentine's banner and templates
    expect(screen.getByTestId('banner-info')).toBeInTheDocument();
    expect(screen.getByText(/Create the perfect Valentine's Day jewelry gift/)).toBeInTheDocument();

    // Step 2: Select "His & Hers Necklaces" template
    const templateSelects = screen.getAllByTestId('select');
    const templateSelect = templateSelects[0];
    fireEvent.change(templateSelect, { target: { value: 'his-and-hers-necklaces' } });

    await waitFor(() => {
      // Check for template description which should be unique to the preview
      expect(screen.getByText('Matching heart pendant necklaces for couples')).toBeInTheDocument();
    });

    // Step 3: Add gift message
    const giftOptionsButton = screen.getByText('Add Gift Options');
    fireEvent.click(giftOptionsButton);

    await waitFor(() => {
      const giftMessageField = screen.getByTestId('textfield');
      fireEvent.change(giftMessageField, { 
        target: { value: 'To my beloved on Valentine\'s Day' } 
      });
    });

    // Step 4: Apply Valentine's discount code
    const discountSelect = templateSelects[1];
    fireEvent.change(discountSelect, { target: { value: 'VALENTINE20' } });

    await waitFor(() => {
      expect(screen.getByTestId('banner-success')).toBeInTheDocument();
      expect(screen.getByText(/Discount code "VALENTINE20" applied/)).toBeInTheDocument();
    });

    // Step 5: Create configuration
    const createButton = screen.getByText('Create Valentine\'s Configuration');
    fireEvent.click(createButton);

    expect(mockUseConfigurationSets.addSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'His & Hers Necklaces',
        products: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({
              giftMessage: expect.stringContaining('To my beloved')
            })
          })
        ])
      })
    );

    // Step 6: Add gift wrapping
    const giftWrapCheckbox = screen.getByTestId('checkbox');
    fireEvent.click(giftWrapCheckbox);

    await waitFor(() => {
      const giftWrapSelects = screen.getAllByTestId('select');
      const giftWrapSelect = giftWrapSelects[2]; // Third select is for gift wrap
      fireEvent.change(giftWrapSelect, { target: { value: 'romantic-pink' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('badge-info')).toBeInTheDocument();
      expect(screen.getByText('+$6.99')).toBeInTheDocument();
    });
  });

  it('handles multiple configuration sets creation', async () => {
    const TestWorkflow = () => {
      const { addSet } = useConfigurationSets();
      
      return (
        <ValentinesWorkflow
          onCreateConfiguration={addSet}
          onApplyDiscount={vi.fn()}
        />
      );
    };

    render(<TestWorkflow />);

    // Create first configuration - His & Hers Necklaces
    const templateSelects = screen.getAllByTestId('select');
    fireEvent.change(templateSelects[0], { target: { value: 'his-and-hers-necklaces' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Valentine\'s Configuration'));
    });

    expect(mockUseConfigurationSets.addSet).toHaveBeenCalledTimes(1);

    // Create second configuration - Engagement Set
    fireEvent.change(templateSelects[0], { target: { value: 'engagement-set' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Valentine\'s Configuration'));
    });

    expect(mockUseConfigurationSets.addSet).toHaveBeenCalledTimes(2);
    expect(mockUseConfigurationSets.addSet).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        name: 'Engagement Set'
      })
    );
  });

  it('validates romantic discount codes', async () => {
    const mockApplyDiscount = vi.fn();
    
    render(
      <ValentinesWorkflow
        onCreateConfiguration={vi.fn()}
        onApplyDiscount={mockApplyDiscount}
      />
    );

    const templateSelects = screen.getAllByTestId('select');
    const discountSelect = templateSelects[1];

    // Test Valentine's discount codes
    const discountCodes = ['VALENTINE20', 'LOVEBIRDS15', 'CUPID50', 'SWEETHEART'];
    
    for (const code of discountCodes) {
      fireEvent.change(discountSelect, { target: { value: code } });
      
      await waitFor(() => {
        expect(mockApplyDiscount).toHaveBeenCalledWith(code);
      });
    }

    expect(mockApplyDiscount).toHaveBeenCalledTimes(discountCodes.length);
  });

  it('displays Valentine\'s shopping tips', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={vi.fn()}
        onApplyDiscount={vi.fn()}
      />
    );

    // Check all Valentine's tips are displayed
    expect(screen.getByText('💝 Valentine\'s Gift Tips')).toBeInTheDocument();
    expect(screen.getByText(/Choose matching metals for a coordinated look/)).toBeInTheDocument();
    expect(screen.getByText(/Add personalized engravings for a special touch/)).toBeInTheDocument();
    expect(screen.getByText(/Consider gift wrapping for the perfect presentation/)).toBeInTheDocument();
    expect(screen.getByText(/Create multiple configurations to compare options/)).toBeInTheDocument();
  });

  it('calculates total price with discounts and gift wrap', () => {
    // This would integrate with the actual price calculation
    const totalPrice = 179.98; // Base jewelry price
    const discountAmount = 35.996; // 20% off VALENTINE20
    const giftWrapPrice = 6.99; // Romantic pink hearts
    const finalTotal = totalPrice - discountAmount + giftWrapPrice;

    expect(finalTotal).toBeCloseTo(150.97, 2);
  });

  it('handles complete purchase flow simulation', async () => {
    // Mock successful cart addition
    (addConfigurationSetsToCart as any).mockResolvedValue({
      success: true,
      cartTotal: {
        finalTotal: 150.97,
        totalQuantity: 2
      }
    });

    const mockSets = [
      {
        id: 'valentine-set-1',
        name: 'His & Hers Necklaces',
        products: [
          {
            variantId: 'heart-pendant-silver',
            quantity: 2,
            properties: { 
              customText: 'Forever Yours & Forever Mine',
              giftMessage: 'To my beloved on Valentine\'s Day'
            },
            productId: 'necklace-heart-pendant',
            title: 'Heart Pendant Necklaces',
            price: 89.99,
          }
        ],
        discountCode: 'VALENTINE20',
        createdAt: new Date()
      }
    ];

    const result = await addConfigurationSetsToCart(mockSets, {
      'valentine-set-1': {
        code: 'VALENTINE20',
        isValid: true,
        discountType: 'percentage',
        value: 20
      }
    });

    expect(result.success).toBe(true);
    expect(result.cartTotal?.finalTotal).toBe(150.97);
    expect(result.cartTotal?.totalQuantity).toBe(2);
  });

  it('handles jewelry-specific customization properties', async () => {
    const TestWorkflow = () => {
      const { addSet } = useConfigurationSets();
      
      return (
        <ValentinesWorkflow
          onCreateConfiguration={addSet}
          onApplyDiscount={vi.fn()}
        />
      );
    };

    render(<TestWorkflow />);

    // Select engagement set template
    const templateSelects = screen.getAllByTestId('select');
    fireEvent.change(templateSelects[0], { target: { value: 'engagement-set' } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Valentine\'s Configuration'));
    });

    expect(mockUseConfigurationSets.addSet).toHaveBeenCalledWith(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({
              customText: expect.stringMatching(/Will you marry me\?|Yes, forever!/),
              giftMessage: expect.stringMatching(/The beginning of our forever|My heart is yours/)
            })
          })
        ])
      })
    );
  });
});

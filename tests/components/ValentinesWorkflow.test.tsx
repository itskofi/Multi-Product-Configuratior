import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ValentinesWorkflow } from '../../app/components/ValentinesWorkflow';
import { valentinesTemplates, valentinesDiscountCodes } from '../../app/data/valentines-products';

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children, variant, as = 'span' }: any) => <div data-testid={`text-${variant || 'default'}`}>{children}</div>,
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={`button-${variant || 'default'}`}>
      {children}
    </button>
  ),
  Select: ({ value, onChange, options, label }: any) => (
    <div data-testid="select-container">
      <label>{label}</label>
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
    </div>
  ),
  TextField: ({ value, onChange, label, multiline }: any) => (
    <div data-testid="textfield-container">
      <label>{label}</label>
      {multiline ? (
        <textarea
          data-testid="textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          data-testid="textfield"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children }: any) => <div data-testid="inlinestack">{children}</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Banner: ({ children, tone }: any) => <div data-testid={`banner-${tone}`}>{children}</div>,
  Badge: ({ children, tone }: any) => <span data-testid={`badge-${tone}`}>{children}</span>,
}));

describe('ValentinesWorkflow', () => {
  const mockOnCreateConfiguration = vi.fn();
  const mockOnApplyDiscount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Valentine\'s Day banner and templates', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    expect(screen.getByTestId('banner-info')).toBeInTheDocument();
    expect(screen.getByText(/Create the perfect Valentine's Day jewelry gift/)).toBeInTheDocument();
    expect(screen.getByText('Valentine\'s Day Templates')).toBeInTheDocument();
  });

  it('displays all template options in select dropdown', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    const selectElements = screen.getAllByTestId('select');
    const templateSelect = selectElements[0]; // First select is for templates
    
    // Check that all templates are available as options
    valentinesTemplates.forEach(template => {
      expect(templateSelect).toHaveTextContent(template.name);
    });
  });

  it('shows template preview when template is selected', async () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    const selectElements = screen.getAllByTestId('select');
    const templateSelect = selectElements[0];
    
    // Select the first template
    fireEvent.change(templateSelect, { target: { value: valentinesTemplates[0].id } });

    await waitFor(() => {
      // Check for template description which should be unique to the preview
      expect(screen.getByText(valentinesTemplates[0].description)).toBeInTheDocument();
    });

    // Check that products are displayed with prices
    valentinesTemplates[0].products.forEach(product => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
    });
    
    // Check that prices are displayed (there may be multiple with same price)
    const prices = screen.getAllByText(`$${valentinesTemplates[0].products[0].price.toFixed(2)}`);
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  it('creates configuration when template is selected and button clicked', async () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    const selectElements = screen.getAllByTestId('select');
    const templateSelect = selectElements[0];
    
    // Select template
    fireEvent.change(templateSelect, { target: { value: valentinesTemplates[0].id } });

    await waitFor(() => {
      const createButton = screen.getByText('Create Valentine\'s Configuration');
      fireEvent.click(createButton);
    });

    expect(mockOnCreateConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        name: valentinesTemplates[0].name,
        products: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            price: expect.any(Number)
          })
        ])
      })
    );
  });

  it('displays and applies discount codes', async () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    const selectElements = screen.getAllByTestId('select');
    const discountSelect = selectElements[1]; // Second select is for discounts
    
    // Check all discount codes are available
    valentinesDiscountCodes.forEach(discount => {
      expect(discountSelect).toHaveTextContent(discount.code);
    });

    // Apply a discount code
    fireEvent.change(discountSelect, { target: { value: 'VALENTINE20' } });

    await waitFor(() => {
      expect(mockOnApplyDiscount).toHaveBeenCalledWith('VALENTINE20');
      expect(screen.getByTestId('banner-success')).toBeInTheDocument();
      expect(screen.getByText(/Discount code "VALENTINE20" applied/)).toBeInTheDocument();
    });
  });

  it('shows and hides gift options', async () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    const giftOptionsButton = screen.getByText('Add Gift Options');
    fireEvent.click(giftOptionsButton);

    await waitFor(() => {
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
      expect(screen.getByText('Personal gift message')).toBeInTheDocument();
    });

    // Hide gift options
    const hideGiftOptionsButton = screen.getByText('Hide Gift Options');
    fireEvent.click(hideGiftOptionsButton);

    await waitFor(() => {
      expect(screen.queryByTestId('textarea')).not.toBeInTheDocument();
    });
  });

  it('includes gift message in configuration when provided', async () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    // Show gift options
    fireEvent.click(screen.getByText('Add Gift Options'));

    await waitFor(() => {
      const giftMessageField = screen.getByTestId('textarea');
      fireEvent.change(giftMessageField, { target: { value: 'Happy Valentine\'s Day!' } });
    });

    // Select template and create configuration
    const selectElements = screen.getAllByTestId('select');
    fireEvent.change(selectElements[0], { target: { value: valentinesTemplates[0].id } });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Valentine\'s Configuration'));
    });

    expect(mockOnCreateConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({
              giftMessage: 'Happy Valentine\'s Day!'
            })
          })
        ])
      })
    );
  });

  it('displays Valentine\'s tips section', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    expect(screen.getByText('💝 Valentine\'s Gift Tips')).toBeInTheDocument();
    expect(screen.getByText(/Choose matching metals for a coordinated look/)).toBeInTheDocument();
    expect(screen.getByText(/Add personalized engravings for a special touch/)).toBeInTheDocument();
    expect(screen.getByText(/Consider gift wrapping for the perfect presentation/)).toBeInTheDocument();
    expect(screen.getByText(/Create multiple configurations to compare options/)).toBeInTheDocument();
  });

  it('handles current discount code prop', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
        currentDiscountCode="VALENTINE20"
      />
    );

    const selectElements = screen.getAllByTestId('select');
    const discountSelect = selectElements[1];
    
    expect((discountSelect as HTMLSelectElement).value).toBe('VALENTINE20');
    expect(screen.getByTestId('banner-success')).toBeInTheDocument();
  });

  it('disables create button when no template is selected', () => {
    render(
      <ValentinesWorkflow
        onCreateConfiguration={mockOnCreateConfiguration}
        onApplyDiscount={mockOnApplyDiscount}
      />
    );

    // Button should not exist when no template is selected
    expect(screen.queryByText('Create Valentine\'s Configuration')).not.toBeInTheDocument();
  });
});

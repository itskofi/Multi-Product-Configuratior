import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GiftWrapComponent } from '../../app/components/GiftWrapComponent';

// Mock Polaris components
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  Text: ({ children, variant, as = 'span' }: any) => <div data-testid={`text-${variant || 'default'}`}>{children}</div>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
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
  TextField: ({ value, onChange, label }: any) => (
    <div data-testid="textfield-container">
      <label>{label}</label>
      <input
        data-testid="textfield"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
  BlockStack: ({ children }: any) => <div data-testid="blockstack">{children}</div>,
  InlineStack: ({ children }: any) => <div data-testid="inlinestack">{children}</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Checkbox: ({ label, checked, onChange }: any) => (
    <div data-testid="checkbox-container">
      <input
        type="checkbox"
        data-testid="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label>{label}</label>
    </div>
  ),
  Badge: ({ children, tone }: any) => <span data-testid={`badge-${tone}`}>{children}</span>,
}));

describe('GiftWrapComponent', () => {
  const mockOnGiftWrapChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gift wrap component with checkbox', () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    expect(screen.getByText('🎁 Gift Wrapping')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Add gift wrapping to this configuration')).toBeInTheDocument();
  });

  it('shows gift wrap options when checkbox is enabled', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByTestId('select')).toBeInTheDocument();
      expect(screen.getByText('Gift wrap style')).toBeInTheDocument();
      expect(screen.getByTestId('textfield')).toBeInTheDocument();
      expect(screen.getByText('Gift message (optional)')).toBeInTheDocument();
    });
  });

  it('hides gift wrap options when checkbox is disabled', async () => {
    render(
      <GiftWrapComponent 
        onGiftWrapChange={mockOnGiftWrapChange}
        initialOptions={{ enabled: true, style: 'classic-red', message: 'Test', price: 5.99 }}
      />
    );

    // Should show options initially
    expect(screen.getByTestId('select')).toBeInTheDocument();

    // Disable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.queryByTestId('select')).not.toBeInTheDocument();
      expect(screen.queryByTestId('textfield')).not.toBeInTheDocument();
    });
  });

  it('calls onGiftWrapChange when checkbox is toggled', () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnGiftWrapChange).toHaveBeenCalledWith({
      enabled: true,
      style: '',
      message: '',
      price: 0
    });
  });

  it('displays price badge when style is selected', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    // Enable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'classic-red' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('badge-info')).toBeInTheDocument();
      expect(screen.getByText('+$5.99')).toBeInTheDocument();
    });
  });

  it('updates price when different style is selected', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    // Enable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const select = screen.getByTestId('select');
      // Select premium velvet box ($12.99)
      fireEvent.change(select, { target: { value: 'premium-velvet' } });
    });

    expect(mockOnGiftWrapChange).toHaveBeenCalledWith({
      enabled: true,
      style: 'premium-velvet',
      message: '',
      price: 12.99
    });
  });

  it('includes gift message in callback', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    // Enable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const messageField = screen.getByTestId('textfield');
      fireEvent.change(messageField, { target: { value: 'Happy Valentine\'s Day!' } });
    });

    expect(mockOnGiftWrapChange).toHaveBeenCalledWith({
      enabled: true,
      style: '',
      message: 'Happy Valentine\'s Day!',
      price: 0
    });
  });

  it('displays style description when style is selected', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    // Enable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const select = screen.getByTestId('select');
      fireEvent.change(select, { target: { value: 'romantic-pink' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/Romantic Pink Hearts - Perfect for Valentine's Day gifts/)).toBeInTheDocument();
    });
  });

  it('initializes with provided options', () => {
    const initialOptions = {
      enabled: true,
      style: 'elegant-gold',
      message: 'With love',
      price: 7.99
    };

    render(
      <GiftWrapComponent 
        onGiftWrapChange={mockOnGiftWrapChange}
        initialOptions={initialOptions}
      />
    );

    expect(screen.getByTestId('checkbox')).toBeChecked();
    expect(screen.getByTestId('badge-info')).toHaveTextContent('+$7.99');
    expect((screen.getByTestId('select') as HTMLSelectElement).value).toBe('elegant-gold');
    expect((screen.getByTestId('textfield') as HTMLInputElement).value).toBe('With love');
  });

  it('resets options when disabled', async () => {
    render(
      <GiftWrapComponent 
        onGiftWrapChange={mockOnGiftWrapChange}
        initialOptions={{ enabled: true, style: 'classic-red', message: 'Test message', price: 5.99 }}
      />
    );

    // Disable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnGiftWrapChange).toHaveBeenCalledWith({
      enabled: false,
      style: '',
      message: '',
      price: 0
    });
  });

  it('displays all available gift wrap styles', async () => {
    render(<GiftWrapComponent onGiftWrapChange={mockOnGiftWrapChange} />);

    // Enable gift wrap
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      const select = screen.getByTestId('select');
      
      // Check that all styles are available
      expect(select).toHaveTextContent('Classic Red Ribbon (+$5.99)');
      expect(select).toHaveTextContent('Elegant Gold Bow (+$7.99)');
      expect(select).toHaveTextContent('Romantic Pink Hearts (+$6.99)');
      expect(select).toHaveTextContent('Premium Velvet Box (+$12.99)');
    });
  });
});

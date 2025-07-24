import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfigurationSets } from '../../app/hooks/useConfigurationSets';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useConfigurationSets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty state when no saved data', () => {
    const { result } = renderHook(() => useConfigurationSets());

    expect(result.current.sets).toHaveLength(1); // Creates initial set
    expect(result.current.activeSetId).toBeTruthy();
    expect(result.current.sets[0].name).toBe('Configuration 1');
    expect(result.current.sets[0].products).toHaveLength(0);
  });

  it('loads saved configuration sets from localStorage', () => {
    const savedState = {
      sets: [
        {
          id: 'test-set-1',
          name: 'Saved Configuration',
          products: [],
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      activeSetId: 'test-set-1',
      discountCodes: {},
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useConfigurationSets());

    expect(result.current.sets).toHaveLength(1);
    expect(result.current.sets[0].name).toBe('Saved Configuration');
    expect(result.current.activeSetId).toBe('test-set-1');
  });

  it('adds new configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    act(() => {
      result.current.addSet();
    });

    expect(result.current.sets).toHaveLength(2);
    expect(result.current.sets[1].name).toBe('Configuration 2');
  });

  it('deletes configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const firstSetId = result.current.sets[0].id;

    act(() => {
      result.current.addSet();
    });

    expect(result.current.sets).toHaveLength(2);

    act(() => {
      result.current.deleteSet(firstSetId);
    });

    expect(result.current.sets).toHaveLength(1);
    expect(result.current.sets.find(set => set.id === firstSetId)).toBeUndefined();
  });

  it('updates configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;

    act(() => {
      result.current.updateSet(setId, { name: 'Updated Name' });
    });

    expect(result.current.sets[0].name).toBe('Updated Name');
  });

  it('duplicates configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const originalSetId = result.current.sets[0].id;

    act(() => {
      result.current.duplicateSet(originalSetId);
    });

    expect(result.current.sets).toHaveLength(2);
    expect(result.current.sets[1].name).toBe('Configuration 1 (Copy)');
    expect(result.current.sets[1].id).not.toBe(originalSetId);
  });

  it('sets active configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    act(() => {
      result.current.addSet();
    });

    const secondSetId = result.current.sets[1].id;

    act(() => {
      result.current.setActiveSet(secondSetId);
    });

    expect(result.current.activeSetId).toBe(secondSetId);
  });

  it('adds product to configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;
    const product = {
      variantId: 'variant-1',
      quantity: 1,
      properties: { customText: 'Test' },
      productId: 'product-1',
      title: 'Test Product',
      price: 50,
    };

    act(() => {
      result.current.addProductToSet(setId, product);
    });

    expect(result.current.sets[0].products).toHaveLength(1);
    expect(result.current.sets[0].products[0]).toEqual(product);
  });

  it('removes product from configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;
    const product1 = {
      variantId: 'variant-1',
      quantity: 1,
      properties: {},
      productId: 'product-1',
      title: 'Product 1',
      price: 50,
    };
    const product2 = {
      variantId: 'variant-2',
      quantity: 2,
      properties: {},
      productId: 'product-2',
      title: 'Product 2',
      price: 30,
    };

    act(() => {
      result.current.addProductToSet(setId, product1);
      result.current.addProductToSet(setId, product2);
    });

    expect(result.current.sets[0].products).toHaveLength(2);

    act(() => {
      result.current.removeProductFromSet(setId, 0);
    });

    expect(result.current.sets[0].products).toHaveLength(1);
    expect(result.current.sets[0].products[0]).toEqual(product2);
  });

  it('updates product in configuration set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;
    const product = {
      variantId: 'variant-1',
      quantity: 1,
      properties: {},
      productId: 'product-1',
      title: 'Product 1',
      price: 50,
    };

    act(() => {
      result.current.addProductToSet(setId, product);
    });

    const updatedProduct = {
      ...product,
      quantity: 3,
      properties: { customText: 'Updated text' },
    };

    act(() => {
      result.current.updateProductInSet(setId, 0, updatedProduct);
    });

    expect(result.current.sets[0].products[0]).toEqual(updatedProduct);
  });

  it('gets all products from all sets', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;
    const product1 = {
      variantId: 'variant-1',
      quantity: 1,
      properties: {},
      productId: 'product-1',
      title: 'Product 1',
      price: 50,
    };

    act(() => {
      result.current.addProductToSet(setId, product1);
      result.current.addSet();
    });

    const secondSetId = result.current.sets[1].id;
    const product2 = {
      variantId: 'variant-2',
      quantity: 2,
      properties: {},
      productId: 'product-2',
      title: 'Product 2',
      price: 30,
    };

    act(() => {
      result.current.addProductToSet(secondSetId, product2);
    });

    const allProducts = result.current.getAllProducts();
    expect(allProducts).toHaveLength(2);
    expect(allProducts).toContainEqual(product1);
    expect(allProducts).toContainEqual(product2);
  });

  it('calculates total price correctly', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const setId = result.current.sets[0].id;
    const product1 = {
      variantId: 'variant-1',
      quantity: 2,
      properties: {},
      productId: 'product-1',
      title: 'Product 1',
      price: 50,
    };
    const product2 = {
      variantId: 'variant-2',
      quantity: 1,
      properties: {},
      productId: 'product-2',
      title: 'Product 2',
      price: 30,
    };

    act(() => {
      result.current.addProductToSet(setId, product1);
      result.current.addProductToSet(setId, product2);
    });

    const totalPrice = result.current.getTotalPrice();
    // (2 * 50) + (1 * 30) = 130
    expect(totalPrice).toBe(130);
  });

  it('saves state to localStorage when state changes', () => {
    const { result } = renderHook(() => useConfigurationSets());

    act(() => {
      result.current.addSet();
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    // Check that setItem was called with configuration data
    const setItemCalls = localStorageMock.setItem.mock.calls;
    expect(setItemCalls.length).toBeGreaterThan(0);
    expect(setItemCalls[0][0]).toBe('configurator-state');
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should not throw and should create initial state
    expect(() => {
      renderHook(() => useConfigurationSets());
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load saved configuration:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('switches active set when deleting current active set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    act(() => {
      result.current.addSet();
    });

    const firstSetId = result.current.sets[0].id;
    const secondSetId = result.current.sets[1].id;

    act(() => {
      result.current.setActiveSet(firstSetId);
    });

    expect(result.current.activeSetId).toBe(firstSetId);

    act(() => {
      result.current.deleteSet(firstSetId);
    });

    expect(result.current.activeSetId).toBe(secondSetId);
  });

  it('sets activeSetId to null when deleting last set', () => {
    const { result } = renderHook(() => useConfigurationSets());

    const onlySetId = result.current.sets[0].id;

    act(() => {
      result.current.deleteSet(onlySetId);
    });

    expect(result.current.sets).toHaveLength(0);
    expect(result.current.activeSetId).toBeNull();
  });
});

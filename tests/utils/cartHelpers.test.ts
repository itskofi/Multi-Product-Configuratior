import { describe, it, expect, vi } from 'vitest';
import {
  configuredProductToCartLine,
  configurationSetToCartLines,
  configurationSetsToCartRequest,
  validateCartItems,
  calculateCartTotal,
  addToShopifyCart,
  addConfigurationSetsToCart,
} from '../../app/utils/cartHelpers';
import type { ConfigurationSet, ConfiguredProduct, DiscountCode } from '../../app/types';

// Mock data
const mockProduct: ConfiguredProduct = {
  variantId: 'variant-123',
  quantity: 2,
  properties: { customText: 'Test', color: 'Red' },
  productId: 'product-123',
  title: 'Test Product',
  price: 29.99,
  image: 'https://example.com/image.jpg',
};

const mockConfigSet: ConfigurationSet = {
  id: 'config-1',
  name: 'Test Configuration',
  products: [mockProduct],
  discountCode: 'TEST20',
  createdAt: new Date('2024-01-01'),
};

const mockDiscountCode: DiscountCode = {
  code: 'TEST20',
  isValid: true,
  discountType: 'percentage',
  value: 20,
};

describe('cartHelpers', () => {
  describe('configuredProductToCartLine', () => {
    it('should convert ConfiguredProduct to CartLineItem', () => {
      const result = configuredProductToCartLine(mockProduct);

      expect(result).toEqual({
        variantId: 'variant-123',
        quantity: 2,
        properties: {
          customText: 'Test',
          color: 'Red',
          _productId: 'product-123',
          _title: 'Test Product',
          _price: '29.99',
        },
      });
    });

    it('should handle products with no properties', () => {
      const productWithoutProps: ConfiguredProduct = {
        ...mockProduct,
        properties: {},
      };

      const result = configuredProductToCartLine(productWithoutProps);

      expect(result.properties).toEqual({
        _productId: 'product-123',
        _title: 'Test Product',
        _price: '29.99',
      });
    });
  });

  describe('configurationSetToCartLines', () => {
    it('should convert ConfigurationSet to CartLineItems', () => {
      const result = configurationSetToCartLines(mockConfigSet);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        variantId: 'variant-123',
        quantity: 2,
        properties: {
          customText: 'Test',
          color: 'Red',
          _productId: 'product-123',
          _title: 'Test Product',
          _price: '29.99',
          _configurationSetId: 'config-1',
          _configurationSetName: 'Test Configuration',
        },
      });
    });

    it('should filter out invalid products', () => {
      const configWithInvalidProduct: ConfigurationSet = {
        ...mockConfigSet,
        products: [
          mockProduct,
          { ...mockProduct, variantId: '', productId: '' }, // Invalid
        ],
      };

      const result = configurationSetToCartLines(configWithInvalidProduct);

      expect(result).toHaveLength(1); // Only valid product included
    });

    it('should return empty array for empty configuration', () => {
      const emptyConfig: ConfigurationSet = {
        ...mockConfigSet,
        products: [],
      };

      const result = configurationSetToCartLines(emptyConfig);

      expect(result).toHaveLength(0);
    });
  });

  describe('configurationSetsToCartRequest', () => {
    it('should convert multiple configuration sets to cart request', () => {
      const configSets = [mockConfigSet];
      const discountCodes = { 'config-1': mockDiscountCode };

      const result = configurationSetsToCartRequest(configSets, discountCodes);

      expect(result.lines).toHaveLength(1);
      expect(result.discountCodes).toEqual(['TEST20']);
    });

    it('should handle multiple configuration sets', () => {
      const configSets = [
        mockConfigSet,
        {
          ...mockConfigSet,
          id: 'config-2',
          name: 'Second Configuration',
          discountCode: 'SAVE30',
        },
      ];
      const discountCodes = {
        'config-1': mockDiscountCode,
        'config-2': { ...mockDiscountCode, code: 'SAVE30', value: 30 },
      };

      const result = configurationSetsToCartRequest(configSets, discountCodes);

      expect(result.lines).toHaveLength(2);
      expect(result.discountCodes).toEqual(['TEST20', 'SAVE30']);
    });

    it('should exclude invalid discount codes', () => {
      const discountCodes = {
        'config-1': { ...mockDiscountCode, isValid: false },
      };

      const result = configurationSetsToCartRequest([mockConfigSet], discountCodes);

      expect(result.discountCodes).toBeUndefined();
    });
  });

  describe('validateCartItems', () => {
    it('should validate valid configuration sets', () => {
      const result = validateCartItems([mockConfigSet]);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(0);
    });

    it('should detect configuration with no products', () => {
      const emptyConfig: ConfigurationSet = {
        ...mockConfigSet,
        products: [],
      };

      const result = validateCartItems([emptyConfig]);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].issues).toContain('No products configured');
    });

    it('should detect invalid products', () => {
      const invalidConfig: ConfigurationSet = {
        ...mockConfigSet,
        products: [
          { ...mockProduct, variantId: '' }, // Missing variant
          { ...mockProduct, productId: '' }, // Missing product ID
          { ...mockProduct, quantity: 0 }, // Invalid quantity
          { ...mockProduct, title: '' }, // Missing title
        ],
      };

      const result = validateCartItems([invalidConfig]);

      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0].issues).toHaveLength(4);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate cart total without discounts', () => {
      const result = calculateCartTotal([mockConfigSet]);

      expect(result.subtotal).toBe(59.98); // 29.99 * 2
      expect(result.totalQuantity).toBe(2);
      expect(result.discountAmount).toBe(0);
      expect(result.finalTotal).toBe(59.98);
      expect(result.breakdown).toHaveLength(1);
    });

    it('should calculate cart total with percentage discount', () => {
      const discountCodes = { 'config-1': mockDiscountCode };

      const result = calculateCartTotal([mockConfigSet], discountCodes);

      expect(result.subtotal).toBe(59.98);
      expect(result.discountAmount).toBe(11.996); // 20% of 59.98
      expect(result.finalTotal).toBeCloseTo(47.984, 2); // Use toBeCloseTo for floating point
    });

    it('should calculate cart total with fixed amount discount', () => {
      const fixedDiscount: DiscountCode = {
        ...mockDiscountCode,
        discountType: 'fixed_amount',
        value: 10,
      };
      const discountCodes = { 'config-1': fixedDiscount };

      const result = calculateCartTotal([mockConfigSet], discountCodes);

      expect(result.discountAmount).toBe(10);
      expect(result.finalTotal).toBe(49.98);
    });

    it('should not exceed subtotal with fixed amount discount', () => {
      const largeFixedDiscount: DiscountCode = {
        ...mockDiscountCode,
        discountType: 'fixed_amount',
        value: 100, // Larger than subtotal
      };
      const discountCodes = { 'config-1': largeFixedDiscount };

      const result = calculateCartTotal([mockConfigSet], discountCodes);

      expect(result.discountAmount).toBe(59.98); // Capped at subtotal
      expect(result.finalTotal).toBe(0);
    });
  });

  describe('addToShopifyCart', () => {
    it('should successfully add items to cart', async () => {
      const cartRequest = {
        lines: [
          {
            variantId: 'variant-123',
            quantity: 2,
            properties: { customText: 'Test' },
          },
        ],
      };

      const result = await addToShopifyCart(cartRequest);

      expect(result.success).toBe(true);
      expect(result.cart).toBeDefined();
      expect(result.cart?.totalQuantity).toBe(2);
    });

    it('should handle out of stock items', async () => {
      const cartRequest = {
        lines: [
          {
            variantId: 'out-of-stock-variant',
            quantity: 1,
          },
        ],
      };

      const result = await addToShopifyCart(cartRequest);

      expect(result.success).toBe(false);
      expect(result.failedItems).toHaveLength(1);
      expect(result.failedItems?.[0].error).toContain('out of stock');
    });

    it('should handle invalid variants', async () => {
      const cartRequest = {
        lines: [
          {
            variantId: 'invalid-variant',
            quantity: 1,
          },
        ],
      };

      const result = await addToShopifyCart(cartRequest);

      expect(result.success).toBe(false);
      expect(result.failedItems).toHaveLength(1);
      expect(result.failedItems?.[0].error).toContain('Invalid product variant');
    });
  });

  describe('addConfigurationSetsToCart', () => {
    it('should successfully add valid configuration sets to cart', async () => {
      const result = await addConfigurationSetsToCart([mockConfigSet]);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.cartTotal).toBeDefined();
    });

    it('should return validation errors for invalid configurations', async () => {
      const invalidConfig: ConfigurationSet = {
        ...mockConfigSet,
        products: [],
      };

      const result = await addConfigurationSetsToCart([invalidConfig]);

      expect(result.success).toBe(false);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors?.[0].issues).toContain('No products configured');
    });

    it('should handle cart API failures', async () => {
      const configWithFailure: ConfigurationSet = {
        ...mockConfigSet,
        products: [
          { ...mockProduct, variantId: 'out-of-stock-variant' },
        ],
      };

      const result = await addConfigurationSetsToCart([configWithFailure]);

      expect(result.success).toBe(false);
      expect(result.result?.success).toBe(false);
    });

    it('should include discount codes in calculation', async () => {
      const discountCodes = { 'config-1': mockDiscountCode };

      const result = await addConfigurationSetsToCart([mockConfigSet], discountCodes);

      expect(result.success).toBe(true);
      expect(result.cartTotal?.discountAmount).toBeGreaterThan(0);
    });
  });
});

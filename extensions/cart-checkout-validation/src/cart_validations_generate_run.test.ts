import { describe, it, expect } from 'vitest';
import { cartValidationsGenerateRun } from './cart_validations_generate_run';

// Mock the generated API types
interface CartLine {
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
}

interface Cart {
  lines: CartLine[];
}

interface CartValidationsGenerateRunInput {
  cart: Cart;
}

interface ValidationError {
  message: string;
  target: string;
}

interface CartValidationsGenerateRunResult {
  operations: Array<{
    validationAdd: {
      errors: ValidationError[];
    };
  }>;
}

describe('Valentine Bundle Cart Validation Function', () => {
  
  const createBundleItem = (
    bundleId: string, 
    bundleName: string, 
    quantity: number = 1,
    additionalAttributes: Array<{ key: string; value: string }> = []
  ): CartLine => ({
    quantity,
    attributes: [
      { key: '_bundle_id', value: bundleId },
      { key: '_bundle_name', value: bundleName },
      { key: '_is_bundle_item', value: 'true' },
      ...additionalAttributes
    ]
  });

  const createRegularItem = (quantity: number = 1): CartLine => ({
    quantity,
    attributes: []
  });

  describe('Bundle Quantity Validation', () => {
    it('should allow valid bundle with matching quantities', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Romantic Bundle', 2),
            createBundleItem('bundle-1', 'Romantic Bundle', 2)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toHaveLength(0);
    });

    it('should reject bundle with mismatched quantities', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Romantic Bundle', 2),
            createBundleItem('bundle-1', 'Romantic Bundle', 3)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: 'All items in "Romantic Bundle" must have the same quantity',
        target: '$.cart'
      });
    });

    it('should reject bundle quantity exceeding limit', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Romantic Bundle', 6),
            createBundleItem('bundle-1', 'Romantic Bundle', 6)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: '"Romantic Bundle" quantity cannot exceed 5 per bundle',
        target: '$.cart'
      });
    });
  });

  describe('Bundle Completeness Validation', () => {
    it('should reject bundle with only one item', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Incomplete Bundle', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: '"Incomplete Bundle" must contain at least 2 items to qualify as a Valentine\'s bundle',
        target: '$.cart'
      });
    });

    it('should reject bundle with too many items', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: Array(12).fill(null).map(() => 
            createBundleItem('bundle-1', 'Oversized Bundle', 1)
          )
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: '"Oversized Bundle" contains too many items (maximum 10 allowed)',
        target: '$.cart'
      });
    });
  });

  describe('Gift Message Validation', () => {
    it('should allow valid gift message', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Gift Bundle', 1, [
              { key: '_gift_message', value: 'Happy Valentine\'s Day!' }
            ]),
            createBundleItem('bundle-1', 'Gift Bundle', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      const giftMessageErrors = result.operations[0].validationAdd.errors.filter(
        (error: ValidationError) => error.message.includes('Gift message')
      );
      expect(giftMessageErrors).toHaveLength(0);
    });

    it('should reject overly long gift message', () => {
      const longMessage = 'A'.repeat(201); // 201 characters
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Gift Bundle', 1, [
              { key: '_gift_message', value: longMessage }
            ]),
            createBundleItem('bundle-1', 'Gift Bundle', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: 'Gift message for "Gift Bundle" is too long (maximum 200 characters)',
        target: '$.cart'
      });
    });
  });

  describe('Discount Code Validation', () => {
    it('should allow valid discount codes', () => {
      const validCodes = ['VALENTINE20', 'LOVE2024', 'HEARTS15'];
      
      validCodes.forEach(code => {
        const input: CartValidationsGenerateRunInput = {
          cart: {
            lines: [
              createBundleItem('bundle-1', 'Discount Bundle', 1, [
                { key: '_discount_code', value: code }
              ]),
              createBundleItem('bundle-1', 'Discount Bundle', 1)
            ]
          }
        };

        const result = cartValidationsGenerateRun(input);
        const discountErrors = result.operations[0].validationAdd.errors.filter(
          (error: ValidationError) => error.message.includes('Invalid discount code')
        );
        expect(discountErrors).toHaveLength(0);
      });
    });

    it('should reject invalid discount codes', () => {
      const invalidCodes = ['invalid code', 'AB', 'TOOLONGDISCOUNTCODE123456789'];
      
      invalidCodes.forEach(code => {
        const input: CartValidationsGenerateRunInput = {
          cart: {
            lines: [
              createBundleItem('bundle-1', 'Invalid Discount Bundle', 1, [
                { key: '_discount_code', value: code }
              ]),
              createBundleItem('bundle-1', 'Invalid Discount Bundle', 1)
            ]
          }
        };

        const result = cartValidationsGenerateRun(input);
        expect(result.operations[0].validationAdd.errors).toContainEqual({
          message: `Invalid discount code "${code}" for "Invalid Discount Bundle"`,
          target: '$.cart'
        });
      });
    });
  });

  describe('Cart-Wide Validation', () => {
    it('should reject too many bundles', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Bundle 1', 1),
            createBundleItem('bundle-1', 'Bundle 1', 1),
            createBundleItem('bundle-2', 'Bundle 2', 1),
            createBundleItem('bundle-2', 'Bundle 2', 1),
            createBundleItem('bundle-3', 'Bundle 3', 1),
            createBundleItem('bundle-3', 'Bundle 3', 1),
            createBundleItem('bundle-4', 'Bundle 4', 1),
            createBundleItem('bundle-4', 'Bundle 4', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: 'Maximum 3 Valentine\'s bundles allowed per order',
        target: '$.cart'
      });
    });

    it('should reject duplicate bundle names', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Romantic Bundle', 1),
            createBundleItem('bundle-1', 'Romantic Bundle', 1),
            createBundleItem('bundle-2', 'Romantic Bundle', 1), // Same name, different ID
            createBundleItem('bundle-2', 'Romantic Bundle', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toContainEqual({
        message: 'Duplicate bundle name "Romantic Bundle" found. Each bundle must have a unique name.',
        target: '$.cart'
      });
    });
  });

  describe('Mixed Cart Validation', () => {
    it('should handle cart with both bundles and regular items', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createBundleItem('bundle-1', 'Valentine Bundle', 1),
            createBundleItem('bundle-1', 'Valentine Bundle', 1),
            createRegularItem(1),
            createRegularItem(2)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      // Should not have bundle-related errors for this valid scenario
      const bundleErrors = result.operations[0].validationAdd.errors.filter(
        (error: ValidationError) => error.message.includes('Bundle') || error.message.includes('Valentine')
      );
      expect(bundleErrors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: []
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toHaveLength(0);
    });

    it('should handle cart with only regular items', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            createRegularItem(1),
            createRegularItem(2),
            createRegularItem(1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      expect(result.operations[0].validationAdd.errors).toHaveLength(0);
    });

    it('should handle malformed bundle attributes gracefully', () => {
      const input: CartValidationsGenerateRunInput = {
        cart: {
          lines: [
            {
              quantity: 1,
              attributes: [
                { key: '_bundle_id', value: 'bundle-1' },
                // Missing bundle name and is_bundle_item
              ]
            },
            createBundleItem('bundle-1', 'Valid Bundle', 1)
          ]
        }
      };

      const result = cartValidationsGenerateRun(input);
      // Should not crash and handle gracefully
      expect(result.operations).toBeDefined();
      expect(result.operations[0].validationAdd.errors).toBeDefined();
    });
  });
});
import type { ConfigurationSet, ConfiguredProduct, DiscountCode } from '../types';

export interface CartLineItem {
  variantId: string;
  quantity: number;
  properties?: { [key: string]: string };
}

export interface BatchCartAddRequest {
  lines: CartLineItem[];
  discountCodes?: string[];
}

export interface CartAddResponse {
  success: boolean;
  error?: string;
  cart?: {
    id: string;
    totalQuantity: number;
    cost: {
      totalAmount: {
        amount: string;
        currencyCode: string;
      };
    };
  };
  failedItems?: {
    variantId: string;
    error: string;
  }[];
}

/**
 * Converts a ConfiguredProduct to a CartLineItem
 */
export function configuredProductToCartLine(product: ConfiguredProduct): CartLineItem {
  return {
    variantId: product.variantId,
    quantity: product.quantity,
    properties: {
      ...product.properties,
      _productId: product.productId,
      _title: product.title,
      _price: product.price.toString(),
    },
  };
}

/**
 * Converts a ConfigurationSet to CartLineItems
 */
export function configurationSetToCartLines(
  configSet: ConfigurationSet
): CartLineItem[] {
  return configSet.products
    .filter(product => product.variantId && product.productId) // Only valid products
    .map(product => ({
      ...configuredProductToCartLine(product),
      properties: {
        ...configuredProductToCartLine(product).properties,
        _configurationSetId: configSet.id,
        _configurationSetName: configSet.name,
      },
    }));
}

/**
 * Converts multiple ConfigurationSets to a single cart request
 */
export function configurationSetsToCartRequest(
  configSets: ConfigurationSet[],
  discountCodes: { [setId: string]: DiscountCode } = {}
): BatchCartAddRequest {
  const allLines: CartLineItem[] = [];
  const validDiscountCodes: string[] = [];

  configSets.forEach(configSet => {
    const lines = configurationSetToCartLines(configSet);
    allLines.push(...lines);

    // Add discount codes if available and valid
    if (configSet.discountCode && discountCodes[configSet.id]?.isValid) {
      validDiscountCodes.push(configSet.discountCode);
    }
  });

  return {
    lines: allLines,
    discountCodes: validDiscountCodes.length > 0 ? validDiscountCodes : undefined,
  };
}

/**
 * Validates products before adding to cart
 */
export function validateCartItems(configSets: ConfigurationSet[]): {
  valid: ConfigurationSet[];
  invalid: {
    setId: string;
    setName: string;
    issues: string[];
  }[];
} {
  const valid: ConfigurationSet[] = [];
  const invalid: { setId: string; setName: string; issues: string[] }[] = [];

  configSets.forEach(configSet => {
    const issues: string[] = [];

    // Check if set has any products
    if (configSet.products.length === 0) {
      issues.push('No products configured');
    }

    // Validate each product
    configSet.products.forEach((product, index) => {
      if (!product.variantId) {
        issues.push(`Product ${index + 1}: No variant selected`);
      }
      if (!product.productId) {
        issues.push(`Product ${index + 1}: No product ID`);
      }
      if (product.quantity <= 0) {
        issues.push(`Product ${index + 1}: Invalid quantity`);
      }
      if (!product.title) {
        issues.push(`Product ${index + 1}: Missing title`);
      }
    });

    if (issues.length > 0) {
      invalid.push({
        setId: configSet.id,
        setName: configSet.name,
        issues,
      });
    } else {
      valid.push(configSet);
    }
  });

  return { valid, invalid };
}

/**
 * Calculates total cart value before adding to cart
 */
export function calculateCartTotal(
  configSets: ConfigurationSet[],
  discountCodes: { [setId: string]: DiscountCode } = {}
): {
  subtotal: number;
  totalQuantity: number;
  discountAmount: number;
  finalTotal: number;
  breakdown: {
    setId: string;
    setName: string;
    subtotal: number;
    quantity: number;
    discountAmount: number;
  }[];
} {
  let subtotal = 0;
  let totalQuantity = 0;
  let totalDiscountAmount = 0;
  const breakdown: any[] = [];

  configSets.forEach(configSet => {
    const setSubtotal = configSet.products.reduce(
      (sum, product) => sum + (product.price * product.quantity),
      0
    );
    const setQuantity = configSet.products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    let setDiscountAmount = 0;
    const discount = discountCodes[configSet.id];
    if (discount && discount.isValid) {
      if (discount.discountType === 'percentage') {
        setDiscountAmount = setSubtotal * (discount.value / 100);
      } else if (discount.discountType === 'fixed_amount') {
        setDiscountAmount = Math.min(discount.value, setSubtotal);
      }
    }

    subtotal += setSubtotal;
    totalQuantity += setQuantity;
    totalDiscountAmount += setDiscountAmount;

    breakdown.push({
      setId: configSet.id,
      setName: configSet.name,
      subtotal: setSubtotal,
      quantity: setQuantity,
      discountAmount: setDiscountAmount,
    });
  });

  return {
    subtotal,
    totalQuantity,
    discountAmount: totalDiscountAmount,
    finalTotal: subtotal - totalDiscountAmount,
    breakdown,
  };
}

/**
 * Simulated Shopify Cart API call
 * In a real implementation, this would call the Shopify Storefront API
 */
export async function addToShopifyCart(
  cartRequest: BatchCartAddRequest
): Promise<CartAddResponse> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate validation
    const failedItems: { variantId: string; error: string }[] = [];
    
    cartRequest.lines.forEach(line => {
      // Simulate inventory check
      if (line.variantId === 'out-of-stock-variant') {
        failedItems.push({
          variantId: line.variantId,
          error: 'Product is out of stock',
        });
      }
      
      // Simulate invalid variant
      if (line.variantId.startsWith('invalid-')) {
        failedItems.push({
          variantId: line.variantId,
          error: 'Invalid product variant',
        });
      }
    });

    if (failedItems.length > 0) {
      return {
        success: false,
        error: `Failed to add ${failedItems.length} item(s) to cart`,
        failedItems,
      };
    }

    // Simulate successful cart response
    const totalQuantity = cartRequest.lines.reduce((sum, line) => sum + line.quantity, 0);
    
    return {
      success: true,
      cart: {
        id: `cart-${Date.now()}`,
        totalQuantity,
        cost: {
          totalAmount: {
            amount: (totalQuantity * 25.99).toFixed(2), // Mock price calculation
            currencyCode: 'USD',
          },
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * High-level function to add all configuration sets to cart
 */
export async function addConfigurationSetsToCart(
  configSets: ConfigurationSet[],
  discountCodes: { [setId: string]: DiscountCode } = {}
): Promise<{
  success: boolean;
  result?: CartAddResponse;
  validationErrors?: { setId: string; setName: string; issues: string[] }[];
  cartTotal?: ReturnType<typeof calculateCartTotal>;
}> {
  // Validate all configuration sets
  const { valid, invalid } = validateCartItems(configSets);

  if (invalid.length > 0) {
    return {
      success: false,
      validationErrors: invalid,
    };
  }

  // Calculate totals
  const cartTotal = calculateCartTotal(valid, discountCodes);

  // Convert to cart request
  const cartRequest = configurationSetsToCartRequest(valid, discountCodes);

  // Add to cart
  const result = await addToShopifyCart(cartRequest);

  return {
    success: result.success,
    result,
    cartTotal,
  };
}

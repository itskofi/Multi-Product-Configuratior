import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";

interface BundleValidationResult {
  errors: ValidationError[];
  bundleGroups: { [bundleId: string]: any[] };
}

export function cartValidationsGenerateRun(input: CartValidationsGenerateRunInput): CartValidationsGenerateRunResult {
  const { errors, bundleGroups } = validateValentineBundles(input);
  
  const operations = [
    {
      validationAdd: {
        errors
      },
    },
  ];

  return { operations };
}

function validateValentineBundles(input: CartValidationsGenerateRunInput): BundleValidationResult {
  const errors: ValidationError[] = [];
  const bundleGroups: { [bundleId: string]: any[] } = {};
  const regularItems: any[] = [];

  // Group cart lines by bundle
  input.cart.lines.forEach((line, index) => {
    const bundleId = line.attributes?.find(attr => attr.key === '_bundle_id')?.value;
    const isBundleItem = line.attributes?.find(attr => attr.key === '_is_bundle_item')?.value === 'true';
    
    if (bundleId && isBundleItem) {
      if (!bundleGroups[bundleId]) {
        bundleGroups[bundleId] = [];
      }
      bundleGroups[bundleId].push({ line, index });
    } else {
      regularItems.push({ line, index });
    }
  });

  // Validate each bundle
  Object.entries(bundleGroups).forEach(([bundleId, items]) => {
    const bundleErrors = validateIndividualBundle(bundleId, items);
    errors.push(...bundleErrors);
  });

  // Additional cart-wide validations
  const cartErrors = validateCartWideRules(bundleGroups, regularItems);
  errors.push(...cartErrors);

  return { errors, bundleGroups };
}

function validateIndividualBundle(bundleId: string, items: { line: any; index: number }[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (items.length === 0) {
    return errors;
  }

  const firstItem = items[0].line;
  const bundleName = firstItem.attributes?.find(attr => attr.key === '_bundle_name')?.value || 'Valentine\'s Bundle';
  
  // Validate all items in bundle have same quantity
  const firstQuantity = items[0].line.quantity;
  const quantityMismatch = items.some(({ line }) => line.quantity !== firstQuantity);
  
  if (quantityMismatch) {
    errors.push({
      message: `All items in "${bundleName}" must have the same quantity`,
      target: "$.cart",
    });
  }

  // Validate bundle completeness (minimum 2 items for Valentine's bundles)
  if (items.length < 2) {
    errors.push({
      message: `"${bundleName}" must contain at least 2 items to qualify as a Valentine's bundle`,
      target: "$.cart",
    });
  }

  // Validate maximum bundle size (prevent cart overflow)
  if (items.length > 10) {
    errors.push({
      message: `"${bundleName}" contains too many items (maximum 10 allowed)`,
      target: "$.cart",
    });
  }

  // Validate bundle quantity limits
  if (firstQuantity > 5) {
    errors.push({
      message: `"${bundleName}" quantity cannot exceed 5 per bundle`,
      target: "$.cart",
    });
  }

  // Validate gift message length if present
  const giftMessage = firstItem.attributes?.find(attr => attr.key === '_gift_message')?.value;
  if (giftMessage && giftMessage.length > 200) {
    errors.push({
      message: `Gift message for "${bundleName}" is too long (maximum 200 characters)`,
      target: "$.cart",
    });
  }

  // Validate discount code format if present
  const discountCode = firstItem.attributes?.find(attr => attr.key === '_discount_code')?.value;
  if (discountCode && !isValidDiscountCode(discountCode)) {
    errors.push({
      message: `Invalid discount code "${discountCode}" for "${bundleName}"`,
      target: "$.cart",
    });
  }

  return errors;
}

function validateCartWideRules(bundleGroups: { [bundleId: string]: any[] }, regularItems: any[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const totalBundles = Object.keys(bundleGroups).length;
  const totalBundleItems = Object.values(bundleGroups).reduce((sum, items) => sum + items.length, 0);
  
  // Validate maximum number of bundles in cart
  if (totalBundles > 3) {
    errors.push({
      message: "Maximum 3 Valentine's bundles allowed per order",
      target: "$.cart",
    });
  }

  // Validate total cart size
  const totalCartItems = totalBundleItems + regularItems.length;
  if (totalCartItems > 50) {
    errors.push({
      message: "Cart contains too many items (maximum 50 allowed)",
      target: "$.cart",
    });
  }

  // Validate Valentine's bundle naming conflicts
  const bundleNames = new Set();
  Object.values(bundleGroups).forEach(items => {
    if (items.length > 0) {
      const bundleName = items[0].line.attributes?.find(attr => attr.key === '_bundle_name')?.value;
      if (bundleName) {
        if (bundleNames.has(bundleName)) {
          errors.push({
            message: `Duplicate bundle name "${bundleName}" found. Each bundle must have a unique name.`,
            target: "$.cart",
          });
        }
        bundleNames.add(bundleName);
      }
    }
  });

  return errors;
}

function isValidDiscountCode(code: string): boolean {
  // Validate discount code format
  // Allow alphanumeric codes, 3-20 characters, common patterns like VALENTINE20, LOVE2024, etc.
  const discountCodePattern = /^[A-Z0-9]{3,20}$/;
  return discountCodePattern.test(code.toUpperCase());
}

// Helper function to get bundle display name
function getBundleDisplayName(bundleId: string, items: { line: any; index: number }[]): string {
  if (items.length === 0) return 'Unknown Bundle';
  
  const bundleName = items[0].line.attributes?.find(attr => attr.key === '_bundle_name')?.value;
  return bundleName || `Bundle ${bundleId.slice(-6)}`;
}
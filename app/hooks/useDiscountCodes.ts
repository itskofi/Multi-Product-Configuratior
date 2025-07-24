import { useState, useCallback } from 'react';
import { DiscountCode } from '../types';

// Mock discount codes for development/testing
const MOCK_DISCOUNT_CODES: { [code: string]: Omit<DiscountCode, 'code'> } = {
  'VALENTINE20': {
    isValid: true,
    discountType: 'percentage',
    value: 20,
  },
  'SAVE10': {
    isValid: true,
    discountType: 'fixed_amount',
    value: 10,
  },
  'JEWELRY25': {
    isValid: true,
    discountType: 'percentage',
    value: 25,
    applicableProducts: ['jewelry', 'necklace', 'ring'],
  },
  'COUPLE15': {
    isValid: true,
    discountType: 'percentage',
    value: 15,
  },
};

export function useDiscountCodes() {
  const [validatingCodes, setValidatingCodes] = useState<Set<string>>(new Set());
  const [appliedCodes, setAppliedCodes] = useState<{ [setId: string]: DiscountCode }>({});

  const validateDiscountCode = useCallback(async (code: string): Promise<DiscountCode | null> => {
    // In a real implementation, this would call the Shopify API
    // For now, we'll use mock data with a delay to simulate API call
    
    setValidatingCodes(prev => new Set(prev).add(code));
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const upperCode = code.toUpperCase();
      const mockData = MOCK_DISCOUNT_CODES[upperCode];
      
      if (mockData) {
        const discountCode: DiscountCode = {
          code: upperCode,
          ...mockData,
        };
        return discountCode;
      }
      
      return {
        code: upperCode,
        isValid: false,
        discountType: 'percentage',
        value: 0,
      };
    } finally {
      setValidatingCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(code);
        return newSet;
      });
    }
  }, []);

  const applyDiscountCode = useCallback((setId: string, discountCode: DiscountCode) => {
    if (discountCode.isValid) {
      setAppliedCodes(prev => ({
        ...prev,
        [setId]: discountCode,
      }));
    }
  }, []);

  const removeDiscountCode = useCallback((setId: string) => {
    setAppliedCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[setId];
      return newCodes;
    });
  }, []);

  const calculateDiscount = useCallback((setId: string, subtotal: number, products: any[] = []): number => {
    const discountCode = appliedCodes[setId];
    if (!discountCode || !discountCode.isValid) {
      return 0;
    }

    // Check if discount applies to specific products
    if (discountCode.applicableProducts && discountCode.applicableProducts.length > 0) {
      const applicableSubtotal = products
        .filter(product => 
          discountCode.applicableProducts!.some(category => 
            product.title.toLowerCase().includes(category.toLowerCase())
          )
        )
        .reduce((sum, product) => sum + (product.price * product.quantity), 0);
      
      if (applicableSubtotal === 0) {
        return 0;
      }
      
      if (discountCode.discountType === 'percentage') {
        return (applicableSubtotal * discountCode.value) / 100;
      } else {
        return Math.min(discountCode.value, applicableSubtotal);
      }
    }

    // Apply to entire subtotal
    if (discountCode.discountType === 'percentage') {
      return (subtotal * discountCode.value) / 100;
    } else {
      return Math.min(discountCode.value, subtotal);
    }
  }, [appliedCodes]);

  const getDiscountCode = useCallback((setId: string): DiscountCode | null => {
    return appliedCodes[setId] || null;
  }, [appliedCodes]);

  const isValidating = useCallback((code: string): boolean => {
    return validatingCodes.has(code);
  }, [validatingCodes]);

  return {
    validateDiscountCode,
    applyDiscountCode,
    removeDiscountCode,
    calculateDiscount,
    getDiscountCode,
    isValidating,
    appliedCodes,
  };
}

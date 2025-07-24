import { useState, useCallback } from "react";
import type { ConfiguredProduct, CartResponse } from "../types";

export function useMultiCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addMultipleToCart = useCallback(async (products: ConfiguredProduct[]): Promise<CartResponse> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Filter out products without variant IDs
      const validProducts = products.filter(product => product.variantId);
      
      if (validProducts.length === 0) {
        throw new Error("No valid products to add to cart");
      }

      // Prepare items for Shopify cart API
      const items = validProducts.map(product => ({
        id: product.variantId,
        quantity: product.quantity,
        properties: product.properties,
      }));

      // For now, we'll simulate the cart API call
      // In a real Shopify app, this would be:
      // const response = await fetch('/cart/add.js', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ items }),
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success response
      const mockResponse: CartResponse = {
        success: true,
        items: items,
      };

      setSuccess(true);
      setIsLoading(false);

      return mockResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add items to cart";
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    addMultipleToCart,
    isLoading,
    error,
    success,
    reset,
  };
}

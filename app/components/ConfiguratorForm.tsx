import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Button,
  Text,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { ProductSlot } from "./ProductSlot";
import { useMultiCart } from "../utils/useMultiCart";
import type { ConfiguredProduct } from "../types";

export function ConfiguratorForm() {
  const [productSlots, setProductSlots] = useState<ConfiguredProduct[]>([
    { variantId: "", quantity: 1, properties: {} },
    { variantId: "", quantity: 1, properties: {} },
    { variantId: "", quantity: 1, properties: {} },
  ]);

  const { addMultipleToCart, isLoading, error, success, reset } = useMultiCart();

  const handleSlotChange = useCallback((index: number, configuredProduct: ConfiguredProduct) => {
    setProductSlots(prev => {
      const newSlots = [...prev];
      newSlots[index] = configuredProduct;
      return newSlots;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    // Reset previous state
    reset();

    // Filter out empty slots (slots without variant IDs)
    const validSlots = productSlots.filter(slot => slot.variantId);

    if (validSlots.length === 0) {
      // Handle no valid products case - this would normally show an error
      return;
    }

    try {
      await addMultipleToCart(validSlots);
    } catch (err) {
      // Error handling is managed by the hook
      console.error("Failed to add products to cart:", err);
    }
  }, [productSlots, addMultipleToCart, reset]);

  const hasValidProducts = productSlots.some(slot => slot.variantId);

  return (
    <Page
      title="Multi-Product Configurator"
      subtitle="Configure up to 3 products and add them to cart simultaneously"
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Status Messages */}
            {success && (
              <Banner
                title="Success!"
                tone="success"
                onDismiss={reset}
              >
                Products have been added to your cart successfully.
              </Banner>
            )}

            {error && (
              <Banner
                title="Error"
                tone="critical"
                onDismiss={reset}
              >
                {error}
              </Banner>
            )}

            {/* Product Slots */}
            {productSlots.map((_, index) => (
              <ProductSlot
                key={index}
                index={index}
                onChange={(configuredProduct) => handleSlotChange(index, configuredProduct)}
              />
            ))}

            {/* Submit Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h3">
                  Add to Cart
                </Text>
                
                <Text variant="bodyMd" tone="subdued" as="p">
                  {hasValidProducts 
                    ? `Ready to add ${productSlots.filter(slot => slot.variantId).length} product(s) to cart`
                    : "Configure at least one product to continue"
                  }
                </Text>

                <Button
                  variant="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!hasValidProducts || isLoading}
                  loading={isLoading}
                >
                  {isLoading ? "Adding to Cart..." : "Add All to Cart"}
                </Button>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

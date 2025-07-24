import { useState, useCallback } from "react";
import {
  Card,
  FormLayout,
  Select,
  TextField,
  BlockStack,
  Text,
} from "@shopify/polaris";
import type { ConfiguredProduct, ProductSlotProps } from "../types";

export function ProductSlot({ index, onChange, product }: ProductSlotProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [customText, setCustomText] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Mock product data for now - this will be replaced with real product data later
  const mockVariants = [
    { label: "Select a variant", value: "" },
    { label: "Red - Small", value: "variant-1" },
    { label: "Red - Medium", value: "variant-2" },
    { label: "Blue - Small", value: "variant-3" },
    { label: "Blue - Medium", value: "variant-4" },
  ];

  const handleVariantChange = useCallback((value: string) => {
    setSelectedVariant(value);
    if (value) {
      const configuredProduct: ConfiguredProduct = {
        variantId: value,
        quantity,
        properties: {
          customText: customText,
          slot: `${index + 1}`,
        },
      };
      onChange(configuredProduct);
    }
  }, [quantity, customText, index, onChange]);

  const handleTextChange = useCallback((value: string) => {
    setCustomText(value);
    if (selectedVariant) {
      const configuredProduct: ConfiguredProduct = {
        variantId: selectedVariant,
        quantity,
        properties: {
          customText: value,
          slot: `${index + 1}`,
        },
      };
      onChange(configuredProduct);
    }
  }, [selectedVariant, quantity, index, onChange]);

  const handleQuantityChange = useCallback((value: string) => {
    const newQuantity = parseInt(value) || 1;
    setQuantity(newQuantity);
    if (selectedVariant) {
      const configuredProduct: ConfiguredProduct = {
        variantId: selectedVariant,
        quantity: newQuantity,
        properties: {
          customText: customText,
          slot: `${index + 1}`,
        },
      };
      onChange(configuredProduct);
    }
  }, [selectedVariant, customText, index, onChange]);

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h3">
          Product Slot {index + 1}
        </Text>
        
        <FormLayout>
          <Select
            label="Product Variant"
            options={mockVariants}
            value={selectedVariant}
            onChange={handleVariantChange}
            placeholder="Choose a variant"
          />
          
          <TextField
            label="Custom Text"
            value={customText}
            onChange={handleTextChange}
            placeholder="Enter custom text (optional)"
            autoComplete="off"
          />
          
          <TextField
            label="Quantity"
            type="number"
            value={quantity.toString()}
            onChange={handleQuantityChange}
            min={1}
            autoComplete="off"
          />
        </FormLayout>
      </BlockStack>
    </Card>
  );
}

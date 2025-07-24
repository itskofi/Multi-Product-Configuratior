import React from 'react';
import {
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Divider,
  Box,
} from '@shopify/polaris';
import { ConfiguredProduct } from '../types';

interface ProductPreviewProps {
  products: ConfiguredProduct[];
  onRemoveProduct: (productIndex: number) => void;
  title?: string;
}

export function ProductPreview({
  products,
  onRemoveProduct,
  title = "Product Preview",
}: ProductPreviewProps) {
  if (products.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">
              {title}
            </Text>
            <Divider />
            <Box padding="400" background="bg-surface-secondary">
              <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                No products configured yet. Start by selecting products in your configuration sets.
              </Text>
            </Box>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalPrice = products.reduce((sum, product) => sum + ((product.price || 0) * product.quantity), 0);

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h3">
              {title}
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {products.length} product{products.length !== 1 ? 's' : ''} • {totalQuantity} items
            </Text>
          </InlineStack>

          <Divider />

          {/* Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {products.map((product, index) => (
              <ProductPreviewCard
                key={index}
                product={product}
                index={index}
                onRemove={() => onRemoveProduct(index)}
              />
            ))}
          </div>

          {/* Summary */}
          <Divider />
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingSm" as="h4">
              Total: ${totalPrice.toFixed(2)}
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {totalQuantity} items total
            </Text>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

interface ProductPreviewCardProps {
  product: ConfiguredProduct;
  index: number;
  onRemove: () => void;
}

function ProductPreviewCard({ product, index, onRemove }: ProductPreviewCardProps) {
  const subtotal = (product.price || 0) * product.quantity;

  return (
    <Card>
      <Box padding="300">
        <BlockStack gap="300">
          {/* Product Header */}
          <InlineStack align="space-between" blockAlign="start">
            <BlockStack gap="100">
              <Text variant="headingSm" as="h4">
                {product.title || `Product ${index + 1}`}
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Variant ID: {product.variantId}
              </Text>
            </BlockStack>
            <Button
              size="micro"
              tone="critical"
              onClick={onRemove}
              accessibilityLabel={`Remove ${product.title || 'product'}`}
            >
              Remove
            </Button>
          </InlineStack>

          {/* Product Image Placeholder */}
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '120px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="bodySm" as="p" tone="subdued">
                No image
              </Text>
            </div>
          )}

          {/* Product Details */}
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text variant="bodySm" as="p">
                Price:
              </Text>
              <Text variant="bodySm" as="p">
                ${(product.price || 0).toFixed(2)}
              </Text>
            </InlineStack>

            <InlineStack align="space-between">
              <Text variant="bodySm" as="p">
                Quantity:
              </Text>
              <Text variant="bodySm" as="p">
                {product.quantity}
              </Text>
            </InlineStack>

            <InlineStack align="space-between">
              <Text variant="headingSm" as="p">
                Subtotal:
              </Text>
              <Text variant="headingSm" as="p">
                ${subtotal.toFixed(2)}
              </Text>
            </InlineStack>
          </BlockStack>

          {/* Custom Properties */}
          {Object.keys(product.properties).length > 0 && (
            <>
              <Divider />
              <BlockStack gap="200">
                <Text variant="bodySm" as="h5" fontWeight="semibold">
                  Customizations:
                </Text>
                {Object.entries(product.properties).map(([key, value]) => (
                  <InlineStack key={key} align="space-between">
                    <Text variant="bodySm" as="span" tone="subdued">
                      {key}:
                    </Text>
                    <Text variant="bodySm" as="span">
                      {value}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}

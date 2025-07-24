import React from 'react';
import {
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from '@shopify/polaris';
import { ConfigurationSet } from '../types';

interface ConfigurationNavigatorProps {
  sets: ConfigurationSet[];
  activeSetId: string | null;
  onSetSelect: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
}

export function ConfigurationNavigator({
  sets,
  activeSetId,
  onSetSelect,
  onAddSet,
  onDeleteSet,
}: ConfigurationNavigatorProps) {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h2">
              Configurations
            </Text>
            <Button size="micro" onClick={onAddSet}>
              Add New
            </Button>
          </InlineStack>

          <Divider />

          <BlockStack gap="200">
            {sets.length === 0 ? (
              <Box padding="400" background="bg-surface-secondary">
                <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                  No configurations yet. Create your first one!
                </Text>
              </Box>
            ) : (
              sets.map((set) => (
                <ConfigurationNavItem
                  key={set.id}
                  set={set}
                  isActive={set.id === activeSetId}
                  onSelect={() => onSetSelect(set.id)}
                  onDelete={() => onDeleteSet(set.id)}
                />
              ))
            )}
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

interface ConfigurationNavItemProps {
  set: ConfigurationSet;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ConfigurationNavItem({
  set,
  isActive,
  onSelect,
  onDelete,
}: ConfigurationNavItemProps) {
  const productCount = set.products.length;
  const totalQuantity = set.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: isActive ? '#f0f8ff' : '#ffffff',
        borderRadius: '8px',
        border: `1px solid ${isActive ? '#0066cc' : '#e0e0e0'}`,
        cursor: 'pointer',
        width: '100%',
      }}
      onClick={onSelect}
    >
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text
              variant="headingSm"
              as="h3"
              tone={isActive ? 'base' : 'subdued'}
            >
              {set.name}
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {productCount} product{productCount !== 1 ? 's' : ''}
              {totalQuantity > 0 && ` • ${totalQuantity} items`}
              {set.discountCode && ` • ${set.discountCode}`}
            </Text>
          </BlockStack>
          
          <div onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}>
            <Button
              size="micro"
              tone="critical"
              accessibilityLabel={`Delete ${set.name}`}
            >
              ×
            </Button>
          </div>
        </InlineStack>

        {/* Mini preview of products */}
        {productCount > 0 && (
          <InlineStack gap="100">
            {set.products.slice(0, 3).map((product, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <Text variant="bodySm" as="span">
                  {product.title || `Product ${index + 1}`}
                </Text>
              </div>
            ))}
            {productCount > 3 && (
              <Text variant="bodySm" as="span" tone="subdued">
                +{productCount - 3} more
              </Text>
            )}
          </InlineStack>
        )}
      </BlockStack>
    </div>
  );
}

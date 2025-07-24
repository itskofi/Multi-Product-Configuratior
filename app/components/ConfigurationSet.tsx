import React from 'react';
import {
  Card,
  Text,
  Button,
  TextField,
  ButtonGroup,
  Box,
  InlineStack,
  BlockStack,
  Badge,
  Divider,
} from '@shopify/polaris';
import { DeleteIcon, DuplicateIcon, EditIcon } from '@shopify/polaris-icons';
import type { ConfigurationSet as ConfigurationSetType, ConfiguredProduct } from '../types';
import { ProductSlot } from './ProductSlot';

interface ConfigurationSetProps {
  configurationSet: ConfigurationSetType;
  isActive?: boolean;
  onUpdate: (updatedSet: ConfigurationSetType) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onActivate: () => void;
}

export function ConfigurationSet({
  configurationSet,
  isActive = false,
  onUpdate,
  onDelete,
  onDuplicate,
  onActivate,
}: ConfigurationSetProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(configurationSet.name);

  const handleNameSave = () => {
    if (editingName.trim()) {
      onUpdate({
        ...configurationSet,
        name: editingName.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditingName(configurationSet.name);
    setIsEditing(false);
  };

  const handleProductUpdate = (index: number, product: ConfiguredProduct) => {
    const newProducts = [...configurationSet.products];
    newProducts[index] = product;
    
    onUpdate({
      ...configurationSet,
      products: newProducts,
    });
  };

  const handleAddProductSlot = () => {
    if (configurationSet.products.length < 5) {
      const newProduct: ConfiguredProduct = {
        variantId: '',
        quantity: 1,
        properties: {},
        productId: '',
        title: '',
        price: 0,
      };
      
      onUpdate({
        ...configurationSet,
        products: [...configurationSet.products, newProduct],
      });
    }
  };

  const handleRemoveProductSlot = (index: number) => {
    const newProducts = configurationSet.products.filter((_, i) => i !== index);
    onUpdate({
      ...configurationSet,
      products: newProducts,
    });
  };

  const getTotalPrice = () => {
    return configurationSet.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const getValidProductsCount = () => {
    return configurationSet.products.filter(product => 
      product.productId && product.variantId
    ).length;
  };

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          {/* Header with name and actions */}
          <InlineStack align="space-between" blockAlign="center">
            <Box>
              {isEditing ? (
                <InlineStack gap="200" blockAlign="center">
                  <TextField
                    value={editingName}
                    onChange={setEditingName}
                    autoComplete="off"
                    label=""
                    labelHidden
                  />
                  <ButtonGroup>
                    <Button size="micro" onClick={handleNameSave}>
                      Save
                    </Button>
                    <Button size="micro" onClick={handleNameCancel}>
                      Cancel
                    </Button>
                  </ButtonGroup>
                </InlineStack>
              ) : (
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingMd" as="h3">
                    {configurationSet.name}
                  </Text>
                  {isActive && <Badge tone="success">Active</Badge>}
                  <Button
                    icon={EditIcon}
                    variant="plain"
                    size="micro"
                    onClick={() => setIsEditing(true)}
                    accessibilityLabel="Edit configuration name"
                  />
                </InlineStack>
              )}
            </Box>

            <ButtonGroup>
              {!isActive && (
                <Button size="micro" onClick={onActivate}>
                  Activate
                </Button>
              )}
              <Button
                icon={DuplicateIcon}
                size="micro"
                onClick={onDuplicate}
                accessibilityLabel="Duplicate configuration"
              />
              <Button
                icon={DeleteIcon}
                size="micro"
                tone="critical"
                onClick={onDelete}
                accessibilityLabel="Delete configuration"
              />
            </ButtonGroup>
          </InlineStack>

          <Divider />

          {/* Configuration info */}
          <InlineStack gap="400">
            <Text variant="bodyMd" as="span" tone="subdued">
              Products: {getValidProductsCount()}/{configurationSet.products.length}
            </Text>
            <Text variant="bodyMd" as="span" tone="subdued">
              Total: ${getTotalPrice().toFixed(2)}
            </Text>
            {configurationSet.discountCode && (
              <Badge tone="info">
                {`Discount: ${configurationSet.discountCode}`}
              </Badge>
            )}
          </InlineStack>

          {/* Product slots */}
          <BlockStack gap="300">
            {configurationSet.products.map((product, index) => (
              <ProductSlot
                key={`${configurationSet.id}-product-${index}`}
                index={index}
                configSetId={configurationSet.id}
                initialProduct={product}
                onChange={(updatedProduct: ConfiguredProduct) => handleProductUpdate(index, updatedProduct)}
                onRemove={() => handleRemoveProductSlot(index)}
                showRemoveButton={configurationSet.products.length > 1}
              />
            ))}

            {/* Add product slot button */}
            {configurationSet.products.length < 5 && (
              <Button
                variant="plain"
                onClick={handleAddProductSlot}
                textAlign="center"
              >
                {`Add Product Slot (${configurationSet.products.length}/5)`}
              </Button>
            )}
          </BlockStack>

          {/* Configuration actions */}
          <InlineStack gap="200">
            <Text variant="bodyMd" as="span" tone="subdued">
              Created: {new Date(configurationSet.createdAt).toLocaleDateString()}
            </Text>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

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

// Legacy props for backward compatibility
interface LegacyConfigurationSetProps {
  set: ConfigurationSetType;
  onUpdateSet: (set: ConfigurationSetType) => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, product: ConfiguredProduct) => void;
}

// New enhanced props interface
interface EnhancedConfigurationSetProps {
  configurationSet: ConfigurationSetType;
  isActive?: boolean;
  onUpdate: (updatedSet: ConfigurationSetType) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onActivate: () => void;
}

type ConfigurationSetProps = LegacyConfigurationSetProps | EnhancedConfigurationSetProps;

function isLegacyProps(props: ConfigurationSetProps): props is LegacyConfigurationSetProps {
  return 'set' in props;
}

export function ConfigurationSet(props: ConfigurationSetProps) {
  // Handle backward compatibility
  let configurationSet: ConfigurationSetType;
  let isActive: boolean;
  let onUpdate: (updatedSet: ConfigurationSetType) => void;
  let onDelete: () => void;
  let onDuplicate: () => void;
  let onActivate: () => void;

  if (isLegacyProps(props)) {
    // Legacy props structure
    configurationSet = props.set;
    isActive = false;
    onUpdate = props.onUpdateSet;
    onDelete = () => {}; // Legacy doesn't have delete
    onDuplicate = () => {}; // Legacy doesn't have duplicate
    onActivate = () => {}; // Legacy doesn't have activate
  } else {
    // New enhanced props structure
    configurationSet = props.configurationSet;
    isActive = props.isActive || false;
    onUpdate = props.onUpdate;
    onDelete = props.onDelete;
    onDuplicate = props.onDuplicate;
    onActivate = props.onActivate;
  }
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
    const newProducts = configurationSet.products.filter((_: ConfiguredProduct, i: number) => i !== index);
    onUpdate({
      ...configurationSet,
      products: newProducts,
    });
  };

    const calculateTotalPrice = (): number => {
    return configurationSet.products.reduce((total: number, product: ConfiguredProduct) => {
      return total + ((product.price || 0) * product.quantity);
    }, 0);
  };

  const getValidProductsCount = () => {
    return configurationSet.products.filter((product: ConfiguredProduct) => 
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
              Total: ${calculateTotalPrice().toFixed(2)}
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
                onChange={(updatedProduct: ConfiguredProduct) => handleProductUpdate(index, updatedProduct)}
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

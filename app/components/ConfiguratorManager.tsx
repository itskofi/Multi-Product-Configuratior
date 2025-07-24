import React, { useState } from 'react';
import { Page, Layout, Card, Button, Text, BlockStack, InlineStack, Box, Banner } from '@shopify/polaris';
import { ConfigurationNavigator } from './ConfigurationNavigator';
import { ConfigurationSet } from './ConfigurationSet';
import { ProductPreview } from './ProductPreview';
import { DiscountCodeInput } from './DiscountCodeInput';
import { useConfigurationSets } from '../hooks/useConfigurationSets';
import { useDiscountCodes } from '../hooks/useDiscountCodes';
import { addConfigurationSetsToCart } from '../utils/cartHelpers';
import type { ConfigurationSet as ConfigurationSetType, ConfiguredProduct, DiscountCode } from '../types';

export function ConfiguratorManager() {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  
  const {
    sets,
    activeSetId,
    activeSet,
    addSet,
    deleteSet,
    updateSet,
    setActiveSet,
    addProductToSet,
    removeProductFromSet,
    updateProductInSet,
    getAllProducts,
    getTotalPrice,
    duplicateSet,
  } = useConfigurationSets();

  const {
    validateDiscountCode,
    applyDiscountCode,
    removeDiscountCode,
    calculateDiscount,
    getDiscountCode,
    isValidating,
    appliedCodes,
  } = useDiscountCodes();

  const totalPrice = getTotalPrice();
  const activeDiscount = activeSetId ? getDiscountCode(activeSetId) : null;
  const discountAmount = activeSetId ? calculateDiscount(activeSetId, totalPrice, activeSet?.products || []) : 0;
  const finalPrice = totalPrice - discountAmount;

  const handleDiscountApplied = (setId: string, discount: DiscountCode) => {
    applyDiscountCode(setId, discount);
  };

  const handleDiscountRemoved = (setId: string) => {
    removeDiscountCode(setId);
  };

  const handleRemoveProduct = (productIndex: number) => {
    if (activeSetId) {
      removeProductFromSet(activeSetId, productIndex);
    }
  };

  const handleConfigurationSetUpdate = (updatedSet: ConfigurationSetType) => {
    updateSet(updatedSet.id, updatedSet);
  };

  const handleConfigurationSetDelete = () => {
    if (activeSetId) {
      deleteSet(activeSetId);
    }
  };

  const handleConfigurationSetDuplicate = () => {
    if (activeSetId) {
      duplicateSet(activeSetId);
    }
  };

  const handleActivateSet = () => {
    // Already active, no action needed
  };

  const handleAddAllToCart = async () => {
    try {
      setIsAddingToCart(true);
      setCartError(null);
      
      const result = await addConfigurationSetsToCart(sets, appliedCodes);
      
      if (result.success) {
        // Show success message or redirect
        console.log('Successfully added to cart:', result.cartTotal);
      } else {
        setCartError(result.validationErrors?.[0]?.issues.join(', ') || 'Failed to add items to cart');
      }
    } catch (error) {
      setCartError('An error occurred while adding items to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Page
      title="Multi-Product Configurator"
      subtitle="Configure multiple products and add them to cart with one click"
      primaryAction={{
        content: `Add All to Cart (${getAllProducts().length} items - $${finalPrice.toFixed(2)})`,
        onAction: handleAddAllToCart,
        loading: isAddingToCart,
        disabled: getAllProducts().length === 0,
      }}
    >
      {cartError && (
        <div style={{ marginBottom: '1rem' }}>
          <Banner title="Cart Error" tone="critical" onDismiss={() => setCartError(null)}>
            <p>{cartError}</p>
          </Banner>
        </div>
      )}

      <Layout>
        <Layout.Section variant="oneThird">
          <Card>
            <ConfigurationNavigator
              sets={sets}
              activeSetId={activeSetId}
              onSetSelect={setActiveSet}
              onAddSet={addSet}
              onDeleteSet={deleteSet}
            />
          </Card>
          
          {activeSetId && (
            <div style={{ marginTop: '1rem' }}>
              <Card>
                <DiscountCodeInput
                  setId={activeSetId}
                  currentCode={activeDiscount?.code}
                  onCodeApplied={handleDiscountApplied}
                  onCodeRemoved={handleDiscountRemoved}
                  subtotal={totalPrice}
                  products={activeSet?.products || []}
                />
              </Card>
            </div>
          )}

          {/* Cart Summary */}
          {sets.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Card>
                <Box padding="400">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      Cart Summary
                    </Text>
                    <InlineStack align="space-between">
                      <Text variant="bodyMd" as="span">
                        Subtotal:
                      </Text>
                      <Text variant="bodyMd" as="span">
                        ${totalPrice.toFixed(2)}
                      </Text>
                    </InlineStack>
                    {discountAmount > 0 && (
                      <InlineStack align="space-between">
                        <Text variant="bodyMd" as="span" tone="success">
                          Discount:
                        </Text>
                        <Text variant="bodyMd" as="span" tone="success">
                          -${discountAmount.toFixed(2)}
                        </Text>
                      </InlineStack>
                    )}
                    <InlineStack align="space-between">
                      <Text variant="headingSm" as="span">
                        Total:
                      </Text>
                      <Text variant="headingSm" as="span">
                        ${finalPrice.toFixed(2)}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
              </Card>
            </div>
          )}
        </Layout.Section>

        <Layout.Section>
          {activeSet ? (
            <ConfigurationSet
              configurationSet={activeSet}
              isActive={true}
              onUpdate={handleConfigurationSetUpdate}
              onDelete={handleConfigurationSetDelete}
              onDuplicate={handleConfigurationSetDuplicate}
              onActivate={handleActivateSet}
            />
          ) : (
            <Card>
              <Box padding="400">
                <Text variant="bodyMd" as="p" alignment="center">
                  No configuration set selected. Create a new configuration to get started.
                </Text>
              </Box>
            </Card>
          )}
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <ProductPreview
            products={getAllProducts()}
            onRemoveProduct={handleRemoveProduct}
            title="Product Summary"
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

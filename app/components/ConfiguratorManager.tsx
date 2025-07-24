import React, { useState } from 'react';
import { Page, Layout, Card } from '@shopify/polaris';
import { ConfigurationNavigator } from './ConfigurationNavigator';
import { ConfigurationSet } from './ConfigurationSet';
import { ProductPreview } from './ProductPreview';
import { DiscountCodeInput } from './DiscountCodeInput';
import { useConfigurationSets } from '../hooks/useConfigurationSets';
import { useDiscountCodes } from '../hooks/useDiscountCodes';
import type { ConfigurationSet as ConfigurationSetType, ConfiguredProduct, DiscountCode } from '../types';

export function ConfiguratorManager() {
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

  return (
    <Page
      title="Multi-Product Configurator"
      subtitle="Configure multiple products and add them to cart with one click"
    >
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
        </Layout.Section>

        <Layout.Section>
          {activeSet ? (
            <ConfigurationSet
              set={activeSet}
              onUpdateSet={(updates: Partial<ConfigurationSetType>) => updateSet(activeSet.id, updates)}
              onAddProduct={(product: ConfiguredProduct) => addProductToSet(activeSet.id, product)}
              onRemoveProduct={(index: number) => removeProductFromSet(activeSet.id, index)}
              onUpdateProduct={(index: number, product: ConfiguredProduct) => updateProductInSet(activeSet.id, index, product)}
            />
          ) : (
            <Card>
              <p>No configuration set selected. Create a new configuration to get started.</p>
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

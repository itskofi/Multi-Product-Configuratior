import React, { useState, useEffect } from 'react';
import {
  useExtensionApi,
  render,
  Banner,
  Card,
  Text,
  Button,
  Divider,
  InlineStack,
  BlockStack,
  Badge,
  Icon,
  Link,
  useCartLines,
  useApplyCartLinesChange,
  useApi
} from '@shopify/ui-extensions-react/checkout';

/**
 * Valentine's Day Bundle Display Cart Extension
 * Shows grouped bundle items in cart with special Valentine's theming
 */
function ValentineBundleDisplay() {
  const { query } = useApi();
  const cartLines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyzeBundles();
  }, [cartLines]);

  const analyzeBundles = () => {
    try {
      setLoading(true);
      
      // Group cart lines by bundle ID
      const bundleGroups = {};
      const regularItems = [];

      cartLines.forEach(line => {
        const bundleId = line.attributes?.find(attr => attr.key === '_bundle_id')?.value;
        const isBundleItem = line.attributes?.find(attr => attr.key === '_is_bundle_item')?.value === 'true';
        
        if (bundleId && isBundleItem) {
          if (!bundleGroups[bundleId]) {
            bundleGroups[bundleId] = {
              id: bundleId,
              name: line.attributes?.find(attr => attr.key === '_bundle_name')?.value || 'Valentine\'s Bundle',
              items: [],
              totalPrice: 0,
              originalPrice: 0,
              savings: 0,
              discountCode: line.attributes?.find(attr => attr.key === '_discount_code')?.value,
              giftWrapping: line.attributes?.find(attr => attr.key === '_gift_wrapping')?.value,
              giftMessage: line.attributes?.find(attr => attr.key === '_gift_message')?.value
            };
          }
          
          bundleGroups[bundleId].items.push(line);
          bundleGroups[bundleId].totalPrice += line.cost.totalAmount.amount * line.quantity;
          bundleGroups[bundleId].originalPrice += (line.merchandise.price?.amount || 0) * line.quantity;
        } else {
          regularItems.push(line);
        }
      });

      // Calculate savings for each bundle
      Object.values(bundleGroups).forEach(bundle => {
        bundle.savings = bundle.originalPrice - bundle.totalPrice;
      });

      setBundles(Object.values(bundleGroups));
      setError(null);
    } catch (err) {
      console.error('Error analyzing bundles:', err);
      setError('Failed to analyze Valentine\'s bundles');
    } finally {
      setLoading(false);
    }
  };

  const removeBundle = async (bundleId) => {
    try {
      const bundleLines = cartLines.filter(line => 
        line.attributes?.find(attr => attr.key === '_bundle_id')?.value === bundleId
      );

      const removeChanges = bundleLines.map(line => ({
        id: line.id,
        quantity: 0
      }));

      await applyCartLinesChange({
        type: 'updateCartLine',
        lines: removeChanges
      });

    } catch (error) {
      console.error('Error removing bundle:', error);
      setError('Failed to remove bundle. Please try again.');
    }
  };

  const updateBundleQuantity = async (bundleId, newQuantity) => {
    try {
      const bundleLines = cartLines.filter(line => 
        line.attributes?.find(attr => attr.key === '_bundle_id')?.value === bundleId
      );

      const updateChanges = bundleLines.map(line => ({
        id: line.id,
        quantity: newQuantity
      }));

      await applyCartLinesChange({
        type: 'updateCartLine',
        lines: updateChanges
      });

    } catch (error) {
      console.error('Error updating bundle quantity:', error);
      setError('Failed to update bundle quantity. Please try again.');
    }
  };

  const editBundle = (bundleId) => {
    // Redirect to configurator with bundle data
    window.open(`/apps/multi-product-config?edit_bundle=${bundleId}`, '_blank');
  };

  if (loading) {
    return (
      <Banner status="info">
        <Text>Loading Valentine's bundles...</Text>
      </Banner>
    );
  }

  if (error) {
    return (
      <Banner status="critical">
        <Text>{error}</Text>
      </Banner>
    );
  }

  if (bundles.length === 0) {
    return null; // No bundles to display
  }

  return (
    <BlockStack spacing="base">
      <Text emphasis="bold" size="large">
        💕 Valentine's Day Bundles
      </Text>
      
      {bundles.map(bundle => (
        <ValentineBundleCard
          key={bundle.id}
          bundle={bundle}
          onRemove={() => removeBundle(bundle.id)}
          onUpdateQuantity={(quantity) => updateBundleQuantity(bundle.id, quantity)}
          onEdit={() => editBundle(bundle.id)}
        />
      ))}
      
      <ValentineBundleSummary bundles={bundles} />
    </BlockStack>
  );
}

function ValentineBundleCard({ bundle, onRemove, onUpdateQuantity, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const bundleQuantity = bundle.items[0]?.quantity || 1;

  return (
    <Card padding="base">
      <BlockStack spacing="tight">
        {/* Bundle Header */}
        <InlineStack blockAlignment="center" inlineAlignment="space-between">
          <InlineStack spacing="tight" blockAlignment="center">
            <Text emphasis="bold">{bundle.name}</Text>
            <Badge tone="attention">Bundle</Badge>
            {bundle.savings > 0 && (
              <Badge tone="success">
                Save ${bundle.savings.toFixed(2)}
              </Badge>
            )}
          </InlineStack>
          
          <InlineStack spacing="tight">
            <Button
              kind="secondary"
              size="small"
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
            <Button
              kind="secondary"
              size="small"
              onPress={onEdit}
            >
              Edit Bundle
            </Button>
          </InlineStack>
        </InlineStack>

        {/* Bundle Summary */}
        <InlineStack inlineAlignment="space-between">
          <Text size="small" appearance="subdued">
            {bundle.items.length} items • Quantity: {bundleQuantity}
          </Text>
          <Text emphasis="bold">
            ${bundle.totalPrice.toFixed(2)}
          </Text>
        </InlineStack>

        {/* Gift Options Display */}
        {(bundle.giftWrapping || bundle.giftMessage) && (
          <BlockStack spacing="extraTight">
            {bundle.giftWrapping && (
              <InlineStack spacing="extraTight" blockAlignment="center">
                <Icon source="gift" size="small" />
                <Text size="small" appearance="subdued">
                  Gift Wrapping: {formatGiftWrapping(bundle.giftWrapping)}
                </Text>
              </InlineStack>
            )}
            {bundle.giftMessage && (
              <InlineStack spacing="extraTight" blockAlignment="center">
                <Icon source="note" size="small" />
                <Text size="small" appearance="subdued">
                  Gift Message: "{bundle.giftMessage}"
                </Text>
              </InlineStack>
            )}
          </BlockStack>
        )}

        {/* Discount Code Display */}
        {bundle.discountCode && (
          <InlineStack spacing="extraTight" blockAlignment="center">
            <Icon source="discount" size="small" />
            <Text size="small" appearance="accent">
              Discount Applied: {bundle.discountCode}
            </Text>
          </InlineStack>
        )}

        {/* Expanded Bundle Details */}
        {isExpanded && (
          <BlockStack spacing="tight">
            <Divider />
            <Text emphasis="bold" size="small">Bundle Items:</Text>
            {bundle.items.map((item, index) => (
              <BundleItem key={item.id} item={item} />
            ))}
          </BlockStack>
        )}

        {/* Bundle Actions */}
        <Divider />
        <InlineStack inlineAlignment="space-between">
          <InlineStack spacing="tight">
            <Button
              kind="secondary"
              size="small"
              onPress={() => onUpdateQuantity(Math.max(1, bundleQuantity - 1))}
              disabled={bundleQuantity <= 1}
            >
              -
            </Button>
            <Text>{bundleQuantity}</Text>
            <Button
              kind="secondary"
              size="small"
              onPress={() => onUpdateQuantity(bundleQuantity + 1)}
            >
              +
            </Button>
          </InlineStack>
          
          <Button
            kind="secondary"
            size="small"
            onPress={onRemove}
            tone="critical"
          >
            Remove Bundle
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function BundleItem({ item }) {
  return (
    <InlineStack inlineAlignment="space-between" blockAlignment="center">
      <InlineStack spacing="tight" blockAlignment="center">
        {item.merchandise.image && (
          <img
            src={item.merchandise.image.url}
            alt={item.merchandise.product.title}
            style={{ width: 40, height: 40, borderRadius: 4 }}
          />
        )}
        <BlockStack spacing="none">
          <Text size="small">{item.merchandise.product.title}</Text>
          {item.merchandise.title !== 'Default Title' && (
            <Text size="extraSmall" appearance="subdued">
              {item.merchandise.title}
            </Text>
          )}
        </BlockStack>
      </InlineStack>
      
      <InlineStack spacing="tight">
        <Text size="small">Qty: {item.quantity}</Text>
        <Text size="small" emphasis="bold">
          ${(item.cost.totalAmount.amount).toFixed(2)}
        </Text>
      </InlineStack>
    </InlineStack>
  );
}

function ValentineBundleSummary({ bundles }) {
  const totalBundles = bundles.length;
  const totalItems = bundles.reduce((sum, bundle) => sum + bundle.items.length, 0);
  const totalSavings = bundles.reduce((sum, bundle) => sum + bundle.savings, 0);
  const totalValue = bundles.reduce((sum, bundle) => sum + bundle.totalPrice, 0);

  if (totalBundles === 0) return null;

  return (
    <Card padding="base">
      <BlockStack spacing="tight">
        <Text emphasis="bold" size="medium">
          🌹 Valentine's Bundle Summary
        </Text>
        
        <InlineStack inlineAlignment="space-between">
          <Text>Bundles:</Text>
          <Text emphasis="bold">{totalBundles}</Text>
        </InlineStack>
        
        <InlineStack inlineAlignment="space-between">
          <Text>Bundle Items:</Text>
          <Text emphasis="bold">{totalItems}</Text>
        </InlineStack>
        
        {totalSavings > 0 && (
          <InlineStack inlineAlignment="space-between">
            <Text>Total Savings:</Text>
            <Text emphasis="bold" tone="success">
              ${totalSavings.toFixed(2)}
            </Text>
          </InlineStack>
        )}
        
        <Divider />
        
        <InlineStack inlineAlignment="space-between">
          <Text emphasis="bold">Bundle Total:</Text>
          <Text emphasis="bold" size="large">
            ${totalValue.toFixed(2)}
          </Text>
        </InlineStack>

        <Banner status="info">
          <BlockStack spacing="extraTight">
            <Text size="small">
              💕 Perfect for Valentine's Day! Your romantic bundles are ready for checkout.
            </Text>
            <Link external url="/apps/multi-product-config">
              Create more Valentine's bundles
            </Link>
          </BlockStack>
        </Banner>
      </BlockStack>
    </Card>
  );
}

// Helper function to format gift wrapping options
function formatGiftWrapping(wrappingStyle) {
  const wrappingNames = {
    'classic-red': 'Classic Red Ribbon',
    'elegant-gold': 'Elegant Gold Bow',
    'romantic-pink': 'Romantic Pink Hearts',
    'premium-velvet': 'Premium Velvet Box'
  };
  
  return wrappingNames[wrappingStyle] || wrappingStyle;
}

// Render the extension
render('Checkout::CartLines::RenderAfter', () => <ValentineBundleDisplay />);

export default ValentineBundleDisplay;

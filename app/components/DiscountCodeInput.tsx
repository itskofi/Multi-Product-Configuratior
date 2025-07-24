import React, { useState, useCallback } from 'react';
import {
  Card,
  Text,
  Button,
  TextField,
  BlockStack,
  InlineStack,
  Banner,
  Spinner,
} from '@shopify/polaris';
import { DiscountCode } from '../types';
import { useDiscountCodes } from '../hooks/useDiscountCodes';

interface DiscountCodeInputProps {
  setId: string;
  currentCode?: string;
  onCodeApplied: (setId: string, discount: DiscountCode) => void;
  onCodeRemoved: (setId: string) => void;
  subtotal: number;
  products?: any[];
}

export function DiscountCodeInput({
  setId,
  currentCode,
  onCodeApplied,
  onCodeRemoved,
  subtotal,
  products = [],
}: DiscountCodeInputProps) {
  const [inputCode, setInputCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    validateDiscountCode,
    isValidating,
    calculateDiscount,
    getDiscountCode,
  } = useDiscountCodes();

  const appliedDiscount = getDiscountCode(setId);
  const discountAmount = appliedDiscount ? calculateDiscount(setId, subtotal, products) : 0;

  const handleApplyCode = useCallback(async () => {
    if (!inputCode.trim()) return;

    setShowError(false);
    setShowSuccess(false);

    try {
      const discountCode = await validateDiscountCode(inputCode.trim());
      
      if (discountCode && discountCode.isValid) {
        onCodeApplied(setId, discountCode);
        setInputCode('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMessage('Invalid discount code. Please check and try again.');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      setErrorMessage('Failed to validate discount code. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [inputCode, validateDiscountCode, onCodeApplied, setId]);

  const handleRemoveCode = useCallback(() => {
    onCodeRemoved(setId);
    setShowSuccess(false);
    setShowError(false);
  }, [onCodeRemoved, setId]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleApplyCode();
    }
  }, [handleApplyCode]);

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <BlockStack gap="400">
          <Text variant="headingSm" as="h3">
            Discount Code
          </Text>

          {/* Success Banner */}
          {showSuccess && (
            <Banner tone="success">
              Discount code applied successfully!
            </Banner>
          )}

          {/* Error Banner */}
          {showError && (
            <Banner tone="critical">
              {errorMessage}
            </Banner>
          )}

          {/* Applied Discount Display */}
          {appliedDiscount && appliedDiscount.isValid && (
            <Card background="bg-surface-success">
              <div style={{ padding: '1rem' }}>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text variant="headingSm" as="h4">
                        {appliedDiscount.code}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        {appliedDiscount.discountType === 'percentage' 
                          ? `${appliedDiscount.value}% off` 
                          : `$${appliedDiscount.value.toFixed(2)} off`}
                      </Text>
                    </BlockStack>
                    <Button
                      size="micro"
                      tone="critical"
                      onClick={handleRemoveCode}
                    >
                      Remove
                    </Button>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="p">
                      Discount amount:
                    </Text>
                    <Text variant="headingSm" as="p" tone="success">
                      -${discountAmount.toFixed(2)}
                    </Text>
                  </InlineStack>

                  {appliedDiscount.applicableProducts && (
                    <Text variant="bodySm" as="p" tone="subdued">
                      Applies to: {appliedDiscount.applicableProducts.join(', ')}
                    </Text>
                  )}
                </BlockStack>
              </div>
            </Card>
          )}

          {/* Discount Code Input */}
          {!appliedDiscount && (
            <BlockStack gap="300">
              <InlineStack gap="200" align="end">
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Enter discount code"
                    value={inputCode}
                    onChange={setInputCode}
                    placeholder="e.g., VALENTINE20"
                    autoComplete="off"
                    disabled={isValidating(inputCode)}
                  />
                </div>
                <Button
                  onClick={handleApplyCode}
                  loading={isValidating(inputCode)}
                  disabled={!inputCode.trim() || isValidating(inputCode)}
                >
                  Apply
                </Button>
              </InlineStack>

              {/* Popular discount codes hint */}
              <BlockStack gap="200">
                <Text variant="bodySm" as="p" tone="subdued">
                  Try these codes:
                </Text>
                <InlineStack gap="200">
                  {['VALENTINE20', 'SAVE10', 'JEWELRY25', 'COUPLE15'].map((code) => (
                    <Button
                      key={code}
                      size="micro"
                      onClick={() => setInputCode(code)}
                      disabled={isValidating(inputCode)}
                    >
                      {code}
                    </Button>
                  ))}
                </InlineStack>
              </BlockStack>
            </BlockStack>
          )}

          {/* Loading state */}
          {isValidating(inputCode) && (
            <InlineStack gap="200" blockAlign="center">
              <Spinner size="small" />
              <Text variant="bodySm" as="p">
                Validating discount code...
              </Text>
            </InlineStack>
          )}
        </BlockStack>
      </div>
    </Card>
  );
}

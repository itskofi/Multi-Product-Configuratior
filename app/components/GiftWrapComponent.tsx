import React, { useState } from 'react';
import {
  Card,
  Text,
  Button,
  Select,
  TextField,
  BlockStack,
  InlineStack,
  Box,
  Checkbox,
  Badge
} from '@shopify/polaris';

interface GiftWrapOptions {
  enabled: boolean;
  style: string;
  message: string;
  price: number;
}

interface GiftWrapComponentProps {
  onGiftWrapChange: (options: GiftWrapOptions) => void;
  initialOptions?: GiftWrapOptions;
}

const GIFT_WRAP_STYLES = [
  { label: 'Classic Red Ribbon', value: 'classic-red', price: 5.99 },
  { label: 'Elegant Gold Bow', value: 'elegant-gold', price: 7.99 },
  { label: 'Romantic Pink Hearts', value: 'romantic-pink', price: 6.99 },
  { label: 'Premium Velvet Box', value: 'premium-velvet', price: 12.99 },
];

export function GiftWrapComponent({ onGiftWrapChange, initialOptions }: GiftWrapComponentProps) {
  const [giftWrapEnabled, setGiftWrapEnabled] = useState(initialOptions?.enabled || false);
  const [selectedStyle, setSelectedStyle] = useState(initialOptions?.style || '');
  const [giftMessage, setGiftMessage] = useState(initialOptions?.message || '');

  const handleGiftWrapToggle = (enabled: boolean) => {
    setGiftWrapEnabled(enabled);
    if (!enabled) {
      setSelectedStyle('');
      setGiftMessage('');
    }
    updateGiftWrapOptions(enabled, enabled ? selectedStyle : '', enabled ? giftMessage : '');
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    updateGiftWrapOptions(giftWrapEnabled, style, giftMessage);
  };

  const handleMessageChange = (message: string) => {
    setGiftMessage(message);
    updateGiftWrapOptions(giftWrapEnabled, selectedStyle, message);
  };

  const updateGiftWrapOptions = (enabled: boolean, style: string, message: string) => {
    const selectedStyleData = GIFT_WRAP_STYLES.find(s => s.value === style);
    const price = enabled && selectedStyleData ? selectedStyleData.price : 0;
    
    onGiftWrapChange({
      enabled,
      style,
      message,
      price
    });
  };

  const styleOptions = [
    { label: 'Choose gift wrap style...', value: '' },
    ...GIFT_WRAP_STYLES.map(style => ({
      label: `${style.label} (+$${style.price})`,
      value: style.value
    }))
  ];

  const selectedStyleData = GIFT_WRAP_STYLES.find(s => s.value === selectedStyle);

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h3">🎁 Gift Wrapping</Text>
            {giftWrapEnabled && selectedStyleData && (
              <Badge tone="info">{`+$${selectedStyleData.price}`}</Badge>
            )}
          </InlineStack>

          <Checkbox
            label="Add gift wrapping to this configuration"
            checked={giftWrapEnabled}
            onChange={handleGiftWrapToggle}
          />

          {giftWrapEnabled && (
            <BlockStack gap="300">
              <Select
                label="Gift wrap style"
                options={styleOptions}
                value={selectedStyle}
                onChange={handleStyleChange}
                placeholder="Select wrapping style..."
              />

              {selectedStyle && (
                <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                  <Text variant="bodyMd" as="p">
                    {selectedStyleData?.label} - Perfect for Valentine's Day gifts
                  </Text>
                </Box>
              )}

              <TextField
                label="Gift message (optional)"
                value={giftMessage}
                onChange={handleMessageChange}
                placeholder="Write a special message for the gift tag..."
                multiline={2}
                autoComplete="off"
                helpText="This message will appear on the gift tag"
              />
            </BlockStack>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}

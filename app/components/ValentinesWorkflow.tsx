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
  Banner,
  Badge
} from '@shopify/polaris';
import type { ConfigurationSet } from '../types';
import { valentinesTemplates, valentinesDiscountCodes } from '../data/valentines-products';

interface ValentinesWorkflowProps {
  onCreateConfiguration: (template: ConfigurationSet) => void;
  onApplyDiscount: (code: string) => void;
  currentDiscountCode?: string;
}

export function ValentinesWorkflow({ 
  onCreateConfiguration, 
  onApplyDiscount,
  currentDiscountCode 
}: ValentinesWorkflowProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [showGiftOptions, setShowGiftOptions] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<string>(currentDiscountCode || '');

  const templateOptions = [
    { label: 'Choose a Valentine\'s template...', value: '' },
    ...valentinesTemplates.map(template => ({
      label: template.name,
      value: template.id
    }))
  ];

  const discountOptions = [
    { label: 'Choose a Valentine\'s discount...', value: '' },
    ...valentinesDiscountCodes.map(discount => ({
      label: `${discount.code} - ${discount.description}`,
      value: discount.code
    }))
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = valentinesTemplates.find(t => t.id === templateId);
    
    if (template) {
      const configurationSet: ConfigurationSet = {
        id: `valentine-${Date.now()}`,
        name: template.name,
        products: template.products.map(product => ({
          ...product,
          properties: {
            ...product.properties,
            giftMessage: giftMessage || product.properties.giftMessage
          }
        })),
        discountCode: selectedDiscount,
        createdAt: new Date()
      };
      
      onCreateConfiguration(configurationSet);
    }
  };

  const handleDiscountSelect = (discountCode: string) => {
    setSelectedDiscount(discountCode);
    if (discountCode) {
      onApplyDiscount(discountCode);
    }
  };

  const getTemplatePreview = () => {
    if (!selectedTemplate) return null;
    
    const template = valentinesTemplates.find(t => t.id === selectedTemplate);
    if (!template) return null;

    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">{template.name}</Text>
            <Text variant="bodyMd" as="p">{template.description}</Text>
            
            <BlockStack gap="200">
              {template.products.map((product, index) => (
                <InlineStack key={index} align="space-between" blockAlign="center">
                  <Text as="span">{product.title}</Text>
                  <Badge tone="success">{`$${product.price.toFixed(2)}`}</Badge>
                </InlineStack>
              ))}
            </BlockStack>

            <Box paddingBlockStart="300">
              <Button 
                variant="primary"
                onClick={() => handleTemplateSelect(selectedTemplate)}
                disabled={!selectedTemplate}
              >
                Create Valentine's Configuration
              </Button>
            </Box>
          </BlockStack>
        </Box>
      </Card>
    );
  };

  return (
    <BlockStack gap="400">
      {/* Valentine's Day Banner */}
      <Banner tone="info">
        <Text variant="bodyMd" as="p">
          💕 Create the perfect Valentine's Day jewelry gift! Choose from our curated templates 
          or build your own romantic combination.
        </Text>
      </Banner>

      {/* Template Selection */}
      <Card>
        <Box padding="400">
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Valentine's Day Templates</Text>
            
            <Select
              label="Choose a romantic jewelry template"
              options={templateOptions}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              placeholder="Select a template..."
            />

            {/* Gift Options */}
            <Button 
              variant="tertiary"
              onClick={() => setShowGiftOptions(!showGiftOptions)}
            >
              {showGiftOptions ? 'Hide' : 'Add'} Gift Options
            </Button>

            {showGiftOptions && (
              <BlockStack gap="300">
                <TextField
                  label="Personal gift message"
                  value={giftMessage}
                  onChange={setGiftMessage}
                  placeholder="Write a romantic message for your Valentine..."
                  multiline={3}
                  autoComplete="off"
                  helpText="This message will be included with each item in your configuration"
                />
              </BlockStack>
            )}
          </BlockStack>
        </Box>
      </Card>

      {/* Template Preview */}
      {getTemplatePreview()}

      {/* Valentine's Discount Codes */}
      <Card>
        <Box padding="400">
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Valentine's Special Offers</Text>
            
            <Select
              label="Apply a romantic discount"
              options={discountOptions}
              value={selectedDiscount}
              onChange={handleDiscountSelect}
              placeholder="Choose a discount code..."
            />

            {selectedDiscount && (
              <Banner tone="success">
                <Text variant="bodyMd" as="p">
                  ✨ Discount code "{selectedDiscount}" applied! 
                  {valentinesDiscountCodes.find(d => d.code === selectedDiscount)?.description}
                </Text>
              </Banner>
            )}
          </BlockStack>
        </Box>
      </Card>

      {/* Valentine's Tips */}
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">💝 Valentine's Gift Tips</Text>
            <BlockStack gap="200">
              <Text as="p">• Choose matching metals for a coordinated look</Text>
              <Text as="p">• Add personalized engravings for a special touch</Text>
              <Text as="p">• Consider gift wrapping for the perfect presentation</Text>
              <Text as="p">• Create multiple configurations to compare options</Text>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );
}

// Type definitions for Multi-Product Configurator - Enhanced Version

export type ConfiguredProduct = {
  variantId: string;
  quantity: number;
  properties: { [key: string]: string };
  productId?: string;
  title?: string;
  price?: number;
  image?: string;
};

export type ConfigurationSet = {
  id: string;
  name: string;
  products: ConfiguredProduct[];
  discountCode?: string;
  createdAt: Date;
};

export type DiscountCode = {
  code: string;
  isValid: boolean;
  discountType: 'percentage' | 'fixed_amount';
  value: number;
  applicableProducts?: string[];
};

export type ConfiguratorState = {
  sets: ConfigurationSet[];
  activeSetId: string | null;
  discountCodes: { [setId: string]: DiscountCode };
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  title: string;
  price: string;
  available: boolean;
  option1?: string;
  option2?: string;
  option3?: string;
};

export type ProductSlotProps = {
  index: number;
  onChange: (configuredProduct: ConfiguredProduct) => void;
  configSetId?: string;
};

export type ConfigurationSetProps = {
  set: ConfigurationSet;
  onUpdate: (set: ConfigurationSet) => void;
  onDelete: (setId: string) => void;
  isActive: boolean;
};

export type ConfigurationNavigatorProps = {
  sets: ConfigurationSet[];
  activeSetId: string | null;
  onSetSelect: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
};

export type ProductPreviewProps = {
  products: ConfiguredProduct[];
  onRemoveProduct: (productIndex: number) => void;
};

export type DiscountCodeInputProps = {
  setId: string;
  currentCode?: string;
  onCodeApplied: (setId: string, discount: DiscountCode) => void;
  onCodeRemoved: (setId: string) => void;
};

export type CartResponse = {
  success: boolean;
  error?: string;
  items?: any[];
};

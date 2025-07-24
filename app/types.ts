// Type definitions for Multi-Product Configurator

export type ConfiguredProduct = {
  variantId: string;
  quantity: number;
  properties: { [key: string]: string };
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
  onChange: (cfg: ConfiguredProduct) => void;
  product?: Product;
};

export type CartResponse = {
  success: boolean;
  error?: string;
  items?: any[];
};

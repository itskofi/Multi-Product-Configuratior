// Type definitions for Valentine's Bundle Cart Extension

export interface BundleItem {
  id: string;
  quantity: number;
  cost: {
    totalAmount: {
      amount: number;
    };
  };
  merchandise: {
    id: string;
    title: string;
    price?: {
      amount: number;
    };
    image?: {
      url: string;
    };
    product: {
      title: string;
      id: string;
    };
  };
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface Bundle {
  id: string;
  name: string;
  items: BundleItem[];
  totalPrice: number;
  originalPrice: number;
  savings: number;
  discountCode?: string;
  giftWrapping?: string;
  giftMessage?: string;
}

export interface BundleCardProps {
  bundle: Bundle;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onEdit: () => void;
}

export interface BundleItemProps {
  item: BundleItem;
}

export interface BundleSummaryProps {
  bundles: Bundle[];
}

export type GiftWrappingStyle = 
  | 'classic-red'
  | 'elegant-gold' 
  | 'romantic-pink'
  | 'premium-velvet';

export interface CartLineChange {
  id: string;
  quantity: number;
}

export interface ApplyCartLinesChangePayload {
  type: 'updateCartLine';
  lines: CartLineChange[];
}

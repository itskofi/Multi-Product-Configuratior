import type { Product } from '../types';

// Valentine's Day Jewelry Product Data
export const valentinesJewelryProducts: Product[] = [
  {
    id: 'necklace-heart-pendant',
    title: 'Heart Pendant Necklace',
    handle: 'heart-pendant-necklace',
    variants: [
      {
        id: 'heart-pendant-silver',
        title: 'Silver Heart Pendant',
        price: '89.99',
        available: true,
        option1: 'Silver',
        option2: '18 inch',
      },
      {
        id: 'heart-pendant-gold',
        title: 'Gold Heart Pendant',
        price: '149.99',
        available: true,
        option1: 'Gold',
        option2: '18 inch',
      },
      {
        id: 'heart-pendant-rose-gold',
        title: 'Rose Gold Heart Pendant',
        price: '129.99',
        available: true,
        option1: 'Rose Gold',
        option2: '20 inch',
      }
    ]
  },
  {
    id: 'matching-couple-rings',
    title: 'Matching Couple Rings',
    handle: 'matching-couple-rings',
    variants: [
      {
        id: 'couple-rings-silver-his',
        title: 'Silver Band - His',
        price: '79.99',
        available: true,
        option1: 'Silver',
        option2: 'Size 10',
      },
      {
        id: 'couple-rings-silver-hers',
        title: 'Silver Band - Hers',
        price: '79.99',
        available: true,
        option1: 'Silver',
        option2: 'Size 7',
      },
      {
        id: 'couple-rings-gold-his',
        title: 'Gold Band - His',
        price: '149.99',
        available: true,
        option1: 'Gold',
        option2: 'Size 10',
      },
      {
        id: 'couple-rings-gold-hers',
        title: 'Gold Band - Hers',
        price: '149.99',
        available: true,
        option1: 'Gold',
        option2: 'Size 7',
      }
    ]
  },
  {
    id: 'charm-bracelet',
    title: 'Valentine Charm Bracelet',
    handle: 'valentine-charm-bracelet',
    variants: [
      {
        id: 'charm-bracelet-silver',
        title: 'Silver Charm Bracelet',
        price: '69.99',
        available: true,
        option1: 'Silver',
        option2: 'Standard',
      },
      {
        id: 'charm-bracelet-gold',
        title: 'Gold Charm Bracelet',
        price: '119.99',
        available: true,
        option1: 'Gold',
        option2: 'Standard',
      }
    ]
  },
  {
    id: 'love-earrings',
    title: 'Love Script Earrings',
    handle: 'love-script-earrings',
    variants: [
      {
        id: 'love-earrings-silver',
        title: 'Silver Love Earrings',
        price: '49.99',
        available: true,
        option1: 'Silver',
        option2: 'Stud',
      },
      {
        id: 'love-earrings-gold',
        title: 'Gold Love Earrings',
        price: '89.99',
        available: true,
        option1: 'Gold',
        option2: 'Stud',
      }
    ]
  }
];

// Valentine's Day Configuration Templates
export const valentinesTemplates = [
  {
    id: 'his-and-hers-necklaces',
    name: 'His & Hers Necklaces',
    description: 'Matching heart pendant necklaces for couples',
    products: [
      {
        variantId: 'heart-pendant-silver',
        quantity: 1,
        properties: {
          customText: 'Forever Yours',
          slot: '1',
          giftMessage: 'To my beloved on Valentine\'s Day'
        },
        productId: 'necklace-heart-pendant',
        title: 'Heart Pendant Necklace - His',
        price: 89.99,
      },
      {
        variantId: 'heart-pendant-silver',
        quantity: 1,
        properties: {
          customText: 'Forever Mine',
          slot: '2',
          giftMessage: 'To my sweetheart with all my love'
        },
        productId: 'necklace-heart-pendant',
        title: 'Heart Pendant Necklace - Hers',
        price: 89.99,
      }
    ]
  },
  {
    id: 'engagement-set',
    name: 'Engagement Set',
    description: 'Complete engagement jewelry set',
    products: [
      {
        variantId: 'couple-rings-gold-his',
        quantity: 1,
        properties: {
          customText: 'Will you marry me?',
          slot: '1',
          giftMessage: 'The beginning of our forever'
        },
        productId: 'matching-couple-rings',
        title: 'Gold Band - His',
        price: 149.99,
      },
      {
        variantId: 'couple-rings-gold-hers',
        quantity: 1,
        properties: {
          customText: 'Yes, forever!',
          slot: '2',
          giftMessage: 'My heart is yours'
        },
        productId: 'matching-couple-rings',
        title: 'Gold Band - Hers',
        price: 149.99,
      }
    ]
  },
  {
    id: 'valentine-surprise',
    name: 'Valentine Surprise Bundle',
    description: 'Complete jewelry gift set',
    products: [
      {
        variantId: 'heart-pendant-rose-gold',
        quantity: 1,
        properties: {
          customText: 'My Valentine',
          slot: '1',
          giftMessage: 'You make my heart skip a beat'
        },
        productId: 'necklace-heart-pendant',
        title: 'Rose Gold Heart Pendant',
        price: 129.99,
      },
      {
        variantId: 'love-earrings-gold',
        quantity: 1,
        properties: {
          customText: 'XOXO',
          slot: '2',
          giftMessage: 'To complete your beautiful look'
        },
        productId: 'love-earrings',
        title: 'Gold Love Earrings',
        price: 89.99,
      },
      {
        variantId: 'charm-bracelet-gold',
        quantity: 1,
        properties: {
          customText: 'Love Always',
          slot: '3',
          giftMessage: 'A charm for every memory we make'
        },
        productId: 'charm-bracelet',
        title: 'Gold Charm Bracelet',
        price: 119.99,
      }
    ]
  }
];

// Valentine's themed discount codes
export const valentinesDiscountCodes = [
  {
    code: 'VALENTINE20',
    isValid: true,
    discountType: 'percentage' as const,
    value: 20,
    description: '20% off Valentine\'s jewelry',
    applicableProducts: ['necklace-heart-pendant', 'matching-couple-rings', 'charm-bracelet', 'love-earrings']
  },
  {
    code: 'LOVEBIRDS15',
    isValid: true,
    discountType: 'percentage' as const,
    value: 15,
    description: '15% off couples jewelry',
    applicableProducts: ['necklace-heart-pendant', 'matching-couple-rings']
  },
  {
    code: 'CUPID50',
    isValid: true,
    discountType: 'fixed_amount' as const,
    value: 50,
    description: '$50 off orders over $200',
    applicableProducts: ['necklace-heart-pendant', 'matching-couple-rings', 'charm-bracelet', 'love-earrings']
  },
  {
    code: 'SWEETHEART',
    isValid: true,
    discountType: 'percentage' as const,
    value: 25,
    description: '25% off Valentine\'s surprise bundles',
    applicableProducts: ['necklace-heart-pendant', 'love-earrings', 'charm-bracelet']
  }
];

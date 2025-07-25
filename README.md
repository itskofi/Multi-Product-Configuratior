# Multi-Product Configurator 🛍️

A powerful Shopify app for creating and managing multi-product configurations with Valentine's Day theming, discount codes, and gift wrapping options. Built with Remix, TypeScript, and Shopify Polaris.

## 🌟 Features

- **🎯 Configuration Sets**: Create, manage, and organize multiple product bundles
- **💕 Valentine's Day Templates**: Pre-built romantic jewelry combinations
- **💰 Discount Codes**: Percentage and fixed-amount promotional codes
- **🎁 Gift Wrapping**: Multiple gift wrap styles with custom messaging
- **🛒 Cart Integration**: Batch add configurations to cart with validation
- **📱 Responsive Design**: Polaris-based UI that works across devices
- **🧪 Comprehensive Testing**: 164 tests with 100% pass rate

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.20 or higher)
- **Shopify Partner Account** ([Create one](https://partners.shopify.com/signup))
- **Development Store** ([Create a development store](https://help.shopify.com/en/partners/dashboard/development-stores))

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd multi-product-config
   npm install
   ```

2. **Set Up Database**
   ```bash
   npm run setup
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Your App**
   - Press `P` in the terminal to open your app URL
   - Install the app in your development store

---

## 📋 How to Use the App

### 1. **Creating Configuration Sets**

**Configuration Sets** are groups of products that customers can purchase together.

1. Navigate to the main configurator page
2. Click **"Add New Configuration"**
3. Name your configuration (e.g., "Valentine's Bundle")
4. Add products to slots using the product selectors
5. Set quantities and customize product properties
6. Save your configuration

### 2. **Using Valentine's Day Templates** 💕

The app includes pre-built Valentine's Day jewelry templates:

1. Go to the **Valentine's Workflow** section
2. Choose from available templates:
   - **His & Hers Set**: Matching couple jewelry ($299.98)
   - **Engagement Dream**: Romantic engagement pieces ($2,799.99)  
   - **Surprise Bundle**: Affordable romantic gifts ($199.97)
3. Customize the gift message
4. Apply Valentine's discount codes
5. Add gift wrapping options

### 3. **Managing Discount Codes** 💰

**Available Valentine's Codes:**
- `VALENTINE20` - 20% off Valentine's products
- `LOVEBIRDS15` - 15% off couple's jewelry sets  
- `CUPID50` - $50 off orders over $200
- `SWEETHEART` - 10% off romantic gifts

**How to Apply:**
1. In any configuration set, find the "Discount Code" section
2. Enter a code or select from suggested codes
3. The discount will be automatically validated and applied
4. View the updated pricing in the cart summary

### 4. **Gift Wrapping Options** 🎁

Add special gift wrapping to any configuration:

1. Open a configuration set
2. Scroll to the **Gift Wrapping** section
3. Enable gift wrapping
4. Choose from styles:
   - Classic Red Ribbon (+$5.99)
   - Elegant Gold Bow (+$7.99)
   - Romantic Pink Hearts (+$6.99)
   - Premium Velvet Box (+$12.99)
5. Add a personalized gift message

### 5. **Cart Management** 🛒

**Add Individual Configuration:**
- Click "Add to Cart" on any configuration set
- Products are added with applied discounts and gift options

**Add All Configurations:**
- Use the "Add All to Cart" button in the cart summary
- Bulk adds all active configurations at once
- Validates inventory and applies all discounts

### 6. **Configuration Management**

**Edit Configurations:**
- Click the edit icon (✏️) next to configuration names
- Modify products, quantities, or properties
- Changes are saved automatically

**Duplicate Configurations:**
- Click the duplicate icon (📋) to copy existing setups
- Useful for creating variations of successful bundles

**Delete Configurations:**
- Click the delete icon (🗑️) with confirmation
- Permanently removes the configuration

---

## 🏗️ Development & Architecture

### Project Structure

```
app/
├── components/          # React components
│   ├── ConfigurationNavigator.tsx    # Sidebar navigation
│   ├── ConfigurationSet.tsx         # Product set management
│   ├── ProductPreview.tsx           # Product display
│   ├── DiscountCodeInput.tsx        # Discount management
│   ├── ValentinesWorkflow.tsx       # Valentine's templates
│   └── GiftWrapComponent.tsx        # Gift wrap options
├── hooks/              # Custom React hooks
│   ├── useConfigurationSets.ts      # Configuration state
│   └── useDiscountCodes.ts         # Discount validation
├── utils/              # Utility functions
│   └── cartHelpers.ts              # Cart operations
├── data/               # Static data
│   └── valentines-products.ts      # Product catalog
└── types.ts           # TypeScript definitions
```

### Key Components

**ConfigurationNavigator**: Vertical sidebar for managing multiple configuration sets
- Create, select, and delete configurations
- Shows product count and total price
- Displays product thumbnails

**ConfigurationSet**: Main product configuration interface  
- Add/remove product slots (max 5 per set)
- Set quantities and custom properties
- Rename configurations with inline editing

**ProductPreview**: Side-by-side product display
- Grid layout with product cards
- Shows pricing, customizations, and images
- Remove products individually

**ValentinesWorkflow**: Valentine's Day specific features
- Pre-built romantic templates
- Themed discount codes
- Gift message integration

### State Management

The app uses custom hooks for state management:

```typescript
// Configuration Sets
const {
  sets,           // All configuration sets
  activeSetId,    // Currently selected set
  addSet,         // Create new set
  updateSet,      // Modify existing set
  deleteSet,      // Remove set
  duplicateSet    // Copy set
} = useConfigurationSets();

// Discount Codes  
const {
  validateDiscountCode,  // Check code validity
  calculateDiscount,     // Apply discount math
  appliedCodes          // Currently applied codes
} = useDiscountCodes();
```

### Testing

The app includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ 164/164 tests passing (100%)
- Component tests for all major features
- Integration tests for Valentine's workflow  
- Cart operation validation
- Hook behavior testing

---

## 🎯 Valentine's Day Use Case

### Complete Valentine's Shopping Experience

The app is specifically designed for Valentine's Day jewelry campaigns:

**Product Catalog:**
- Diamond Engagement Ring ($1,499.99)
- Heart Pendant Necklace ($899.99) 
- Promise Ring Set ($299.99)
- Love Knot Earrings ($599.99)

**Romantic Templates:**
1. **His & Hers Set**: Matching promise rings and necklace
2. **Engagement Dream**: Diamond ring with heart pendant
3. **Surprise Bundle**: Earrings and promise ring combination

**Themed Features:**
- Valentine's discount codes with romantic names
- Gift wrapping with heart and romance themes
- Personal message cards for each gift
- Couples shopping workflow

### Business Benefits

**For Merchants:**
- Increase average order value with product bundles
- Reduce cart abandonment with pre-configured sets
- Seasonal campaign management (Valentine's, anniversaries)
- Bulk inventory management

**For Customers:**  
- Simplified gift selection process
- Coordinated product combinations
- Transparent pricing with discounts
- Professional gift presentation options

---

## 🛠️ API Integration

### Shopify Admin API

The app integrates with Shopify's Admin API for:

```javascript
// Product Management
const products = await admin.graphql(`
  query getProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        variants(first: 10) {
          nodes {
            id
            price
            availableForSale
          }
        }
      }
    }
  }
`);

// Cart Operations
const cartResponse = await admin.rest.resources.Cart.save({
  session,
  line_items: configuredProducts
});
```

### Database Schema

```prisma
model Session {
  id          String   @id
  shop        String
  state       String
  isOnline    Boolean  @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
}
```

---

## 🚀 Deployment

### Environment Variables

Create a `.env` file with:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_products,write_products,read_orders,write_orders
HOST=your_app_url
```

### Build for Production

```bash
# Build the app
npm run build

# Start production server  
npm start
```

### Hosting Options

**Recommended Platforms:**
- [Vercel](https://vercel.com/) - Easy Remix deployment
- [Fly.io](https://fly.io/) - Global edge deployment
- [Heroku](https://heroku.com/) - Traditional cloud hosting

**Database Options:**
- SQLite (included) - For single-instance deployments
- PostgreSQL - For production scalability
- MySQL - For existing infrastructure

---

## 🧪 Testing Guide

### Running Tests

```bash
# All tests
npm test

# Specific component
npm test ProductPreview

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### Test Categories

**Component Tests**: UI component behavior
**Hook Tests**: State management logic  
**Integration Tests**: End-to-end workflows
**Utility Tests**: Helper function validation

### Writing New Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { ConfigurationSet } from '../ConfigurationSet';

test('renders configuration with products', () => {
  render(<ConfigurationSet {...mockProps} />);
  expect(screen.getByText('Valentine Bundle')).toBeInTheDocument();
});
```

---

## 🔧 Customization

### Adding New Product Templates

1. **Create Template Data** (`app/data/templates.ts`):
```typescript
export const customTemplates = [
  {
    id: 'anniversary-special',
    name: 'Anniversary Special',
    description: 'Perfect for celebrating love',
    products: [
      // Product configurations
    ]
  }
];
```

2. **Update Workflow Component**:
```typescript
// Add to ValentinesWorkflow.tsx
import { customTemplates } from '../data/templates';
```

### Custom Discount Logic

Extend `useDiscountCodes.ts`:

```typescript
const customDiscountRules = {
  'BULK20': (products) => products.length >= 3 ? 0.20 : 0,
  'PREMIUM50': (products) => products.some(p => p.price > 1000) ? 50 : 0
};
```

### Styling Customization

The app uses Shopify Polaris components. Customize with:

```css
/* Custom CSS for specific styling */
.valentine-theme {
  --p-color-bg-surface: #fff0f5;
  --p-color-border: #ff69b4;
}
```

---

## 📚 Additional Resources

### Shopify Development
- [Shopify App Documentation](https://shopify.dev/docs/apps)
- [Admin API Reference](https://shopify.dev/docs/api/admin)
- [Polaris Design System](https://polaris.shopify.com/)

### Framework Documentation  
- [Remix Framework](https://remix.run/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools & Libraries
- [Vitest Testing Framework](https://vitest.dev/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Vite Build Tool](https://vitejs.dev/)

---

## 🐛 Troubleshooting

### Common Issues

**"Tables don't exist" Error:**
```bash
npm run setup
```

**OAuth Loop:**
```bash
npm run deploy
```

**Development Server Issues:**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
rm -rf .shopify
npm run dev
```

**Type Errors:**
- Check `app/types.ts` for interface definitions
- Ensure all props match component interfaces
- Run `npm run build` to catch TypeScript errors

### Performance Tips

- Use React.memo for expensive components
- Implement proper loading states
- Optimize product image loading
- Cache discount code validations

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards

- Use TypeScript for type safety
- Follow Polaris design patterns
- Write tests for new features
- Use semantic commit messages
- Maintain 100% test coverage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

For questions and support:

- 📧 Email: [support@example.com](mailto:support@example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Shopify Partner Documentation](https://shopify.dev/docs)

---

**Made with ❤️ for Valentine's Day shopping experiences**

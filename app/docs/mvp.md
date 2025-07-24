# Shopify Multi-Product Configurator - MVP Development Plan

## 🎯 Project Overview

**Goal**: Build a Shopify app for merchant shops that allows configuring multiple products simultaneously (variant, text, color) and adding them to cart with a single AJAX click - without page reload.

**Approach**: Keep it minimal with only 3 fixed product slots, no dynamic adding, no live preview.

## 🛠 Tech Stack
- **Framework**: Remix (SSR, `useFetcher` / `action()`)
- **UI**: Shopify Polaris (Cards, Select, TextField, Button)
- **Language**: TypeScript
- **Styling**: Polaris CSS (no Tailwind)

## 📁 Target File Structure
```
shopify-multi-config/
├── app/
│   ├── components/
│   │   ├── ProductSlot.tsx
│   │   └── ConfiguratorForm.tsx
│   ├── routes/
│   │   └── index.tsx
│   ├── styles/
│   │   └── Polaris.css
│   └── types.ts
├── package.json
├── remix.config.js
└── README.md
```

## 📋 Development Tasks

### 1. Project Initialization
**Goal**: Create new Remix project as foundation for SSR, routing, and action handling

**Subtasks**:
- [x] ~~Create new Remix project with `npx create-remix@latest shopify-multi-config`~~ (Already exists)
- [x] ~~Open `shopify-multi-config` directory~~ (Working in existing project)
- [x] ~~Start dev server and run smoke test: `npm run dev` → http://localhost:3000~~ (Shopify app structure ready)
- [x] ~~Verify basic Remix setup is working~~ (Dependencies confirmed in package.json)

**Status**: ✅ **COMPLETED** - Existing Shopify Remix app structure in place

---

### 2. Polaris Integration
**Goal**: Install Polaris library & integrate CSS for consistent Shopify UI

**Subtasks**:
- [x] ~~Install Polaris packages: `npm install @shopify/polaris @shopify/polaris-icons`~~ (Already installed)
- [ ] Import Polaris CSS in `app/root.tsx`:
  ```ts
  import "@shopify/polaris/build/esm/styles.css";
  import { AppProvider } from "@shopify/polaris";
  import enTranslations from "@shopify/polaris/locales/en.json";
  ```
- [ ] Wrap `<AppProvider>` around `<Outlet />`
- [ ] Test Polaris components are rendering correctly

**Status**: 🔄 **IN PROGRESS** - Packages installed, need to configure in root.tsx

---

### 3. Type Definitions
**Goal**: Define common TypeScript types for clear data interfaces and maintainability

**Subtasks**:
- [ ] Create `app/types.ts` file
- [ ] Define `ConfiguredProduct` type:
  ```ts
  export type ConfiguredProduct = {
    variantId: string;
    quantity: number;
    properties: { [key: string]: string };
  };
  ```
- [ ] Add additional types as needed (Product, Variant, etc.)

**Status**: ⏳ Pending

---

### 4. ProductSlot Component
**Goal**: Create reusable single configuration form (variant & text) component

**Subtasks**:
- [ ] Create `app/components/ProductSlot.tsx` file
- [ ] Implement Polaris `Card`, `Select`, `TextField` components
- [ ] Define props: `{ index: number; onChange(cfg: ConfiguredProduct): void }`
- [ ] Call `onChange` on Select & TextField changes
- [ ] Add proper TypeScript typing
- [ ] Style component with Polaris design system

**Status**: ⏳ Pending

---

### 5. useMultiCart Hook
**Goal**: Separate business logic for sending multiple items to `/cart/add.js`

**Subtasks**:
- [ ] Create `app/utils/useMultiCart.ts` file
- [ ] Export `function useMultiCart(slots: ConfiguredProduct[])`
- [ ] Implement AJAX fetch call to Shopify cart API
- [ ] Add error handling and loading states
- [ ] Return appropriate status and error messages

**Status**: ⏳ Pending

---

### 6. ConfiguratorForm Component
**Goal**: Combine 3 ProductSlots with submit button and manage state

**Subtasks**:
- [ ] Create `app/components/ConfiguratorForm.tsx` file
- [ ] Initialize `useState<ConfiguredProduct[]>` for 3 slots
- [ ] Use `useFetcher()` or `useMultiCart()` for AJAX handling
- [ ] Add Polaris `Button` for submission
- [ ] Implement form validation
- [ ] Handle loading and success/error states

**Status**: ⏳ Pending

---

### 7. Route & Action Implementation
**Goal**: Implement Remix standard for form handling with server actions

**Subtasks**:
- [ ] Update `app/routes/index.tsx` with action export
- [ ] Implement `export const action: ActionFunction = async ({ request }) => { ... }`
- [ ] Parse FormData and extract items with `JSON.parse(items)`
- [ ] Implement fetch to `https://{shop}.myshopify.com/cart/add.js`
- [ ] Add comprehensive error handling: `return json({ error: '...' })`
- [ ] Test action with different scenarios

**Status**: ⏳ Pending

---

### 8. Testing & QA
**Goal**: Ensure everything works correctly through manual testing

**Subtasks**:
- [ ] Test filling 3 slots and clicking button → verify cart contents
- [ ] Test mobile view responsiveness (Chrome DevTools)
- [ ] Test error cases: empty text, invalid variant ID
- [ ] Test edge cases: special characters, long text
- [ ] Verify loading states and user feedback
- [ ] Cross-browser compatibility check

**Status**: ⏳ Pending

---

### 9. Deployment
**Goal**: Deploy MVP to hosting for live testing and stakeholder demo

**Subtasks**:
- [ ] Initialize Git repository and push to GitHub
- [ ] Set up Vercel integration (automatic Remix adapter)
- [ ] Configure environment variables for shop URL
- [ ] Test deployed version thoroughly
- [ ] Document deployment process

**Status**: ⏳ Pending

---

## 📄 Documentation Requirements

### README.md Content
- [ ] Project name & brief description
- [ ] Tech stack overview
- [ ] Setup instructions (steps 1-3)
- [ ] Usage guide (how to use the configurator)
- [ ] Deployment instructions (Vercel, env vars)
- [ ] To-do list (dynamic slots, live preview, App Bridge)

## 🔄 Progress Tracking

**Current Phase**: Polaris Integration 🔄  
**Next Phase**: Type Definitions  
**Overall Progress**: 1/9 tasks completed (Task 1 ✅)

## 📝 Notes & Important Information

### Key Decisions Made:
- Using existing Remix project structure instead of creating new one
- Focus on MVP with 3 fixed product slots
- Polaris for consistent Shopify UI/UX

### Technical Considerations:
- Need to handle Shopify's cart API authentication
- AJAX calls must handle CORS and Shopify's security requirements
- Consider rate limiting for cart operations

### Potential Challenges:
- Shopify cart API integration complexity
- Handling different product variant structures
- Error handling for network failures
- Mobile responsiveness with Polaris components

---

**Last Updated**: 24. Juli 2025  
**Status**: Ready to begin development  
**Next Action**: Start with Task 1 - Project Initialization
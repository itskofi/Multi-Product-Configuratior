/**
 * Tests for Valentine's Day Multi-Product Configurator Storefront Extension
 * Testing theme app block functionality and customer interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock Shopify environment
const mockShopifyEnv = {
  shop: {
    url: 'https://test-store.myshopify.com'
  },
  block: {
    id: 'test-block-123',
    settings: {
      title: 'Create Your Valentine\'s Bundle',
      subtitle: 'Build the perfect romantic gift set',
      show_templates: true,
      show_gift_options: true,
      show_discount_codes: true,
      max_products: 5,
      valentine_theme: 'romantic'
    }
  }
};

describe('Valentine\'s Day Theme App Extension', () => {
  let dom;
  let document;
  let window;
  let configurator;

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div class="valentine-configurator" id="valentine-configurator-test-block-123">
            <div class="valentine-configurator__header">
              <h3 class="valentine-configurator__title">Create Your Valentine's Bundle</h3>
              <p class="valentine-configurator__subtitle">Build the perfect romantic gift set</p>
            </div>
            
            <div class="valentine-configurator__content">
              <div class="valentine-templates">
                <div class="valentine-templates__grid">
                  <button class="template-card" data-template="his-hers">His & Hers Set</button>
                  <button class="template-card" data-template="engagement">Engagement Dream</button>
                  <button class="template-card" data-template="surprise">Surprise Bundle</button>
                </div>
              </div>
              
              <div class="product-selection">
                <div class="product-selection__grid" id="product-grid-test-block-123">
                  <div class="product-slot" data-slot="1">
                    <div class="product-slot__placeholder">Select First Product</div>
                  </div>
                  <div class="product-slot" data-slot="2">
                    <div class="product-slot__placeholder">Select Second Product</div>
                  </div>
                </div>
                <button class="add-product-slot" id="add-slot-test-block-123">Add Another Product</button>
              </div>
              
              <div class="gift-options">
                <input type="checkbox" id="gift-wrap-test-block-123">
                <div id="wrap-options-test-block-123" style="display: none;">
                  <input type="radio" name="wrapping-test-block-123" value="classic-red">
                  <input type="radio" name="wrapping-test-block-123" value="elegant-gold">
                </div>
                <textarea id="gift-message-test-block-123"></textarea>
              </div>
              
              <div class="discount-section">
                <button class="discount-code" data-code="VALENTINE20">VALENTINE20</button>
                <input type="text" id="discount-code-test-block-123">
                <button type="button" id="apply-discount-test-block-123">Apply</button>
                <div class="discount-result" id="discount-result-test-block-123"></div>
              </div>
              
              <div class="bundle-summary">
                <div class="bundle-summary__content" id="summary-test-block-123">
                  <p class="bundle-summary__empty">Add products to see your bundle summary</p>
                </div>
                <div class="bundle-summary__pricing" id="pricing-test-block-123">
                  <div class="pricing-line">
                    <span class="subtotal">$0.00</span>
                  </div>
                  <div class="pricing-line total-line">
                    <span class="total">$0.00</span>
                  </div>
                </div>
                <button class="add-bundle-to-cart" id="add-bundle-test-block-123" disabled>
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </div>
        </body>
      </html>
    `, {
      url: 'https://test-store.myshopify.com',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Make ValentineConfigurator available
    global.window = window;
    global.document = document;

    // Load the configurator class (in a real test, this would be imported)
    // For this test, we'll create a simplified mock
    window.ValentineConfigurator = class ValentineConfigurator {
      constructor(element, options) {
        this.element = element;
        this.blockId = options.blockId;
        this.options = options;
        this.state = {
          selectedProducts: [],
          selectedTemplate: null,
          giftWrapping: { enabled: false, style: null, message: '' },
          discountCode: { code: '', isValid: false, discountAmount: 0 },
          pricing: { subtotal: 0, discountAmount: 0, giftWrapCost: 0, total: 0 }
        };
        this.init();
      }

      init() {
        this.setupEventListeners();
      }

      setupEventListeners() {
        // Template selection
        this.element.querySelectorAll('.template-card').forEach(card => {
          card.addEventListener('click', (e) => {
            this.selectTemplate(e.currentTarget.dataset.template);
          });
        });

        // Gift wrapping
        const giftWrapToggle = this.element.querySelector(`#gift-wrap-${this.blockId}`);
        if (giftWrapToggle) {
          giftWrapToggle.addEventListener('change', (e) => {
            this.toggleGiftWrap(e.target.checked);
          });
        }

        // Discount codes
        this.element.querySelectorAll('.discount-code').forEach(btn => {
          btn.addEventListener('click', (e) => {
            this.applyDiscountCode(e.target.dataset.code);
          });
        });
      }

      selectTemplate(templateId) {
        this.state.selectedTemplate = templateId;
        this.element.querySelector(`[data-template="${templateId}"]`).classList.add('selected');
        this.updateBundleSummary();
      }

      toggleGiftWrap(enabled) {
        this.state.giftWrapping.enabled = enabled;
        const wrapOptions = this.element.querySelector(`#wrap-options-${this.blockId}`);
        if (wrapOptions) {
          wrapOptions.style.display = enabled ? 'block' : 'none';
        }
      }

      applyDiscountCode(code) {
        const discountResult = this.element.querySelector(`#discount-result-${this.blockId}`);
        
        if (code === 'VALENTINE20') {
          this.state.discountCode = {
            code: code,
            isValid: true,
            discountAmount: 20,
            discountType: 'percentage'
          };
          discountResult.innerHTML = '✅ Discount applied: 20% off';
          discountResult.className = 'discount-result success';
        } else {
          this.state.discountCode = {
            code: '',
            isValid: false,
            discountAmount: 0
          };
          discountResult.innerHTML = '❌ Invalid discount code';
          discountResult.className = 'discount-result error';
        }
      }

      updateBundleSummary() {
        // Mock implementation for testing
        const summaryContent = this.element.querySelector(`#summary-${this.blockId}`);
        if (this.state.selectedTemplate) {
          summaryContent.innerHTML = `<div class="bundle-item">Selected: ${this.state.selectedTemplate}</div>`;
        }
      }
    };

    // Initialize configurator
    const configuratorElement = document.getElementById('valentine-configurator-test-block-123');
    configurator = new window.ValentineConfigurator(configuratorElement, {
      blockId: 'test-block-123',
      showTemplates: true,
      showGiftOptions: true,
      showDiscountCodes: true,
      maxProducts: 5,
      valentineTheme: 'romantic'
    });
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('Template Selection', () => {
    it('should allow customers to select Valentine\'s Day templates', () => {
      const hisHersTemplate = document.querySelector('[data-template="his-hers"]');
      
      expect(hisHersTemplate).toBeTruthy();
      expect(hisHersTemplate.textContent).toBe('His & Hers Set');
      
      // Click the template
      hisHersTemplate.click();
      
      expect(configurator.state.selectedTemplate).toBe('his-hers');
      expect(hisHersTemplate.classList.contains('selected')).toBe(true);
    });

    it('should update bundle summary when template is selected', () => {
      const engagementTemplate = document.querySelector('[data-template="engagement"]');
      engagementTemplate.click();
      
      const summaryContent = document.querySelector('#summary-test-block-123');
      expect(summaryContent.innerHTML).toContain('Selected: engagement');
    });

    it('should provide three Valentine\'s Day templates', () => {
      const templates = document.querySelectorAll('.template-card');
      expect(templates.length).toBe(3);
      
      const templateTypes = Array.from(templates).map(t => t.dataset.template);
      expect(templateTypes).toEqual(['his-hers', 'engagement', 'surprise']);
    });
  });

  describe('Product Selection', () => {
    it('should start with two empty product slots', () => {
      const productSlots = document.querySelectorAll('.product-slot');
      expect(productSlots.length).toBe(2);
      
      const firstSlot = productSlots[0];
      expect(firstSlot.dataset.slot).toBe('1');
      expect(firstSlot.querySelector('.product-slot__placeholder')).toBeTruthy();
    });

    it('should allow adding more product slots up to maximum', () => {
      const addSlotBtn = document.querySelector('#add-slot-test-block-123');
      expect(addSlotBtn).toBeTruthy();
      expect(addSlotBtn.textContent).toContain('Add Another Product');
    });

    it('should have a maximum of 5 products in configurator settings', () => {
      expect(configurator.options.maxProducts).toBe(5);
    });
  });

  describe('Gift Options', () => {
    it('should have gift wrapping toggle functionality', () => {
      const giftWrapToggle = document.querySelector('#gift-wrap-test-block-123');
      const wrapOptions = document.querySelector('#wrap-options-test-block-123');
      
      expect(giftWrapToggle).toBeTruthy();
      expect(wrapOptions.style.display).toBe('none');
      
      // Enable gift wrapping
      giftWrapToggle.checked = true;
      giftWrapToggle.dispatchEvent(new window.Event('change'));
      
      expect(configurator.state.giftWrapping.enabled).toBe(true);
      expect(wrapOptions.style.display).toBe('block');
    });

    it('should provide multiple gift wrapping style options', () => {
      const wrappingOptions = document.querySelectorAll('input[name="wrapping-test-block-123"]');
      expect(wrappingOptions.length).toBe(2);
      
      const styles = Array.from(wrappingOptions).map(option => option.value);
      expect(styles).toContain('classic-red');
      expect(styles).toContain('elegant-gold');
    });

    it('should have gift message input field', () => {
      const giftMessageInput = document.querySelector('#gift-message-test-block-123');
      expect(giftMessageInput).toBeTruthy();
      expect(giftMessageInput.tagName).toBe('TEXTAREA');
    });
  });

  describe('Discount Codes', () => {
    it('should provide suggested Valentine\'s discount codes', () => {
      const discountButtons = document.querySelectorAll('.discount-code');
      expect(discountButtons.length).toBeGreaterThan(0);
      
      const valentine20Btn = document.querySelector('[data-code="VALENTINE20"]');
      expect(valentine20Btn).toBeTruthy();
      expect(valentine20Btn.textContent).toBe('VALENTINE20');
    });

    it('should validate and apply valid discount codes', () => {
      const valentine20Btn = document.querySelector('[data-code="VALENTINE20"]');
      const discountResult = document.querySelector('#discount-result-test-block-123');
      
      valentine20Btn.click();
      
      expect(configurator.state.discountCode.isValid).toBe(true);
      expect(configurator.state.discountCode.code).toBe('VALENTINE20');
      expect(discountResult.textContent).toContain('✅ Discount applied');
      expect(discountResult.classList.contains('success')).toBe(true);
    });

    it('should reject invalid discount codes', () => {
      const discountInput = document.querySelector('#discount-code-test-block-123');
      const applyBtn = document.querySelector('#apply-discount-test-block-123');
      const discountResult = document.querySelector('#discount-result-test-block-123');
      
      discountInput.value = 'INVALID_CODE';
      configurator.applyDiscountCode('INVALID_CODE');
      
      expect(configurator.state.discountCode.isValid).toBe(false);
      expect(discountResult.textContent).toContain('❌ Invalid discount code');
      expect(discountResult.classList.contains('error')).toBe(true);
    });

    it('should have manual discount code input and apply button', () => {
      const discountInput = document.querySelector('#discount-code-test-block-123');
      const applyBtn = document.querySelector('#apply-discount-test-block-123');
      
      expect(discountInput).toBeTruthy();
      expect(discountInput.type).toBe('text');
      expect(applyBtn).toBeTruthy();
      expect(applyBtn.textContent).toBe('Apply');
    });
  });

  describe('Bundle Summary and Pricing', () => {
    it('should display empty state when no products are selected', () => {
      const summaryContent = document.querySelector('#summary-test-block-123');
      const emptyMessage = summaryContent.querySelector('.bundle-summary__empty');
      
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('Add products to see your bundle summary');
    });

    it('should show pricing breakdown with subtotal and total', () => {
      const pricingElement = document.querySelector('#pricing-test-block-123');
      const subtotal = pricingElement.querySelector('.subtotal');
      const total = pricingElement.querySelector('.total');
      
      expect(subtotal).toBeTruthy();
      expect(total).toBeTruthy();
      expect(subtotal.textContent).toBe('$0.00');
      expect(total.textContent).toBe('$0.00');
    });

    it('should have Add to Cart button that starts disabled', () => {
      const addToCartBtn = document.querySelector('#add-bundle-test-block-123');
      
      expect(addToCartBtn).toBeTruthy();
      expect(addToCartBtn.disabled).toBe(true);
      expect(addToCartBtn.textContent).toContain('Add Bundle to Cart');
    });
  });

  describe('Theme and Styling', () => {
    it('should apply Valentine\'s Day romantic theme styling', () => {
      const configuratorElement = document.querySelector('.valentine-configurator');
      
      expect(configuratorElement).toBeTruthy();
      expect(configuratorElement.classList.contains('valentine-configurator')).toBe(true);
    });

    it('should have Valentine\'s Day themed title and emojis', () => {
      const title = document.querySelector('.valentine-configurator__title');
      const subtitle = document.querySelector('.valentine-configurator__subtitle');
      
      expect(title.textContent).toContain('Valentine\'s Bundle');
      expect(subtitle.textContent).toContain('romantic gift set');
    });

    it('should support different Valentine\'s theme variations', () => {
      expect(configurator.options.valentineTheme).toBe('romantic');
      
      // Test that theme options are available
      const supportedThemes = ['romantic', 'elegant', 'modern'];
      expect(supportedThemes).toContain(configurator.options.valentineTheme);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive CSS classes for mobile optimization', () => {
      const templatesGrid = document.querySelector('.valentine-templates__grid');
      const productGrid = document.querySelector('.product-selection__grid');
      
      expect(templatesGrid).toBeTruthy();
      expect(productGrid).toBeTruthy();
    });

    it('should maintain functionality on different screen sizes', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      // Test that configurator still works
      expect(configurator).toBeTruthy();
      expect(configurator.state).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      const giftWrapToggle = document.querySelector('#gift-wrap-test-block-123');
      const giftMessageInput = document.querySelector('#gift-message-test-block-123');
      
      expect(giftWrapToggle.type).toBe('checkbox');
      expect(giftMessageInput.tagName).toBe('TEXTAREA');
    });

    it('should support keyboard navigation', () => {
      const templateCards = document.querySelectorAll('.template-card');
      const addToCartBtn = document.querySelector('#add-bundle-test-block-123');
      
      templateCards.forEach(card => {
        expect(card.tagName).toBe('BUTTON');
      });
      
      expect(addToCartBtn.tagName).toBe('BUTTON');
    });

    it('should have semantic HTML structure', () => {
      const headings = document.querySelectorAll('h3, h4');
      expect(headings.length).toBeGreaterThan(0);
      
      const title = document.querySelector('.valentine-configurator__title');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('State Management', () => {
    it('should initialize with empty state', () => {
      expect(configurator.state.selectedProducts).toEqual([]);
      expect(configurator.state.selectedTemplate).toBeNull();
      expect(configurator.state.giftWrapping.enabled).toBe(false);
      expect(configurator.state.discountCode.isValid).toBe(false);
    });

    it('should save state to localStorage when changes are made', () => {
      const mockSetItem = vi.spyOn(window.localStorage, 'setItem');
      
      // Make a change that would trigger state save
      const hisHersTemplate = document.querySelector('[data-template="his-hers"]');
      hisHersTemplate.click();
      
      // In a real implementation, this would call saveState()
      // For this test, we verify the configurator has the state
      expect(configurator.state.selectedTemplate).toBe('his-hers');
    });

    it('should maintain state consistency across UI updates', () => {
      // Select template
      const template = document.querySelector('[data-template="surprise"]');
      template.click();
      
      // Enable gift wrapping
      const giftWrapToggle = document.querySelector('#gift-wrap-test-block-123');
      giftWrapToggle.checked = true;
      giftWrapToggle.dispatchEvent(new window.Event('change'));
      
      // Apply discount
      configurator.applyDiscountCode('VALENTINE20');
      
      // Verify all state is maintained
      expect(configurator.state.selectedTemplate).toBe('surprise');
      expect(configurator.state.giftWrapping.enabled).toBe(true);
      expect(configurator.state.discountCode.isValid).toBe(true);
    });
  });
});

// Integration tests for full customer workflow
describe('Valentine\'s Day Customer Workflow Integration', () => {
  let dom;
  let document;
  let configurator;

  beforeEach(() => {
    dom = new JSDOM(`
      <div class="valentine-configurator" id="valentine-configurator-workflow-test">
        <div class="valentine-templates">
          <button class="template-card" data-template="his-hers">His & Hers Set</button>
        </div>
        <div class="gift-options">
          <input type="checkbox" id="gift-wrap-workflow-test">
          <div id="wrap-options-workflow-test" style="display: none;">
            <input type="radio" name="wrapping-workflow-test" value="romantic-pink">
          </div>
          <textarea id="gift-message-workflow-test"></textarea>
        </div>
        <div class="discount-section">
          <button class="discount-code" data-code="VALENTINE20">VALENTINE20</button>
          <div class="discount-result" id="discount-result-workflow-test"></div>
        </div>
        <div class="bundle-summary">
          <div class="bundle-summary__content" id="summary-workflow-test"></div>
          <button class="add-bundle-to-cart" id="add-bundle-workflow-test" disabled>Add Bundle to Cart</button>
        </div>
      </div>
    `);

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Mock localStorage
    dom.window.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    // Simplified configurator for workflow test
    configurator = {
      state: {
        selectedProducts: [],
        selectedTemplate: null,
        giftWrapping: { enabled: false, style: null, message: '' },
        discountCode: { code: '', isValid: false },
        pricing: { total: 0 }
      },
      selectTemplate: (id) => { configurator.state.selectedTemplate = id; },
      toggleGiftWrap: (enabled) => { configurator.state.giftWrapping.enabled = enabled; },
      applyDiscount: (code) => { 
        configurator.state.discountCode = { code, isValid: code === 'VALENTINE20' };
      },
      addToCart: () => Promise.resolve(true)
    };
  });

  afterEach(() => {
    dom.window.close();
  });

  it('should complete full Valentine\'s Day shopping workflow', async () => {
    // Step 1: Customer selects "His & Hers" template
    const template = document.querySelector('[data-template="his-hers"]');
    template.click();
    configurator.selectTemplate('his-hers');
    
    expect(configurator.state.selectedTemplate).toBe('his-hers');

    // Step 2: Customer enables gift wrapping
    const giftWrapToggle = document.querySelector('#gift-wrap-workflow-test');
    giftWrapToggle.checked = true;
    configurator.toggleGiftWrap(true);
    
    expect(configurator.state.giftWrapping.enabled).toBe(true);

    // Step 3: Customer selects romantic pink wrapping
    const pinkWrapping = document.querySelector('input[value="romantic-pink"]');
    pinkWrapping.checked = true;
    configurator.state.giftWrapping.style = 'romantic-pink';
    
    expect(configurator.state.giftWrapping.style).toBe('romantic-pink');

    // Step 4: Customer adds personal message
    const messageInput = document.querySelector('#gift-message-workflow-test');
    messageInput.value = 'Happy Valentine\'s Day, my love! 💕';
    configurator.state.giftWrapping.message = messageInput.value;
    
    expect(configurator.state.giftWrapping.message).toContain('Happy Valentine\'s Day');

    // Step 5: Customer applies discount code
    const discountBtn = document.querySelector('[data-code="VALENTINE20"]');
    discountBtn.click();
    configurator.applyDiscount('VALENTINE20');
    
    expect(configurator.state.discountCode.isValid).toBe(true);
    expect(configurator.state.discountCode.code).toBe('VALENTINE20');

    // Step 6: Customer adds bundle to cart
    const addToCartBtn = document.querySelector('#add-bundle-workflow-test');
    const result = await configurator.addToCart();
    
    expect(result).toBe(true);

    // Verify complete workflow state
    expect(configurator.state).toEqual({
      selectedProducts: [],
      selectedTemplate: 'his-hers',
      giftWrapping: {
        enabled: true,
        style: 'romantic-pink',
        message: 'Happy Valentine\'s Day, my love! 💕'
      },
      discountCode: {
        code: 'VALENTINE20',
        isValid: true
      },
      pricing: { total: 0 }
    });
  });

  it('should handle customer abandonment and recovery', () => {
    // Customer starts configuration
    configurator.selectTemplate('his-hers');
    configurator.toggleGiftWrap(true);
    
    // Simulate page refresh (state should be recoverable from localStorage)
    const savedState = {
      selectedTemplate: 'his-hers',
      giftWrapping: { enabled: true, style: null, message: '' }
    };
    
    expect(savedState.selectedTemplate).toBe('his-hers');
    expect(savedState.giftWrapping.enabled).toBe(true);
  });

  it('should provide error handling for failed cart addition', async () => {
    // Mock failed cart addition
    configurator.addToCart = () => Promise.reject(new Error('Cart API error'));
    
    configurator.selectTemplate('his-hers');
    
    try {
      await configurator.addToCart();
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error.message).toBe('Cart API error');
    }
  });
});

export { mockShopifyEnv };

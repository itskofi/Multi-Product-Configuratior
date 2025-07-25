/**
 * Valentine's Day Multi-Product Configurator JavaScript
 * Interactive bundle creation for storefront customers
 */

class ValentineConfigurator {
  constructor(element, options = {}) {
    this.element = element;
    this.blockId = options.blockId;
    this.options = {
      maxProducts: options.maxProducts || 5,
      showTemplates: options.showTemplates !== false,
      showGiftOptions: options.showGiftOptions !== false,
      showDiscountCodes: options.showDiscountCodes !== false,
      valentineTheme: options.valentineTheme || 'romantic',
      appUrl: options.appUrl || '',
      ...options
    };

    // State management
    this.state = {
      selectedProducts: [],
      selectedTemplate: null,
      giftWrapping: {
        enabled: false,
        style: null,
        message: ''
      },
      discountCode: {
        code: '',
        isValid: false,
        discountAmount: 0,
        discountType: 'percentage'
      },
      pricing: {
        subtotal: 0,
        discountAmount: 0,
        giftWrapCost: 0,
        total: 0
      }
    };

    // Initialize the configurator
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTemplates();
    this.loadProducts();
    this.updateTheme();
    
    // Load saved state from localStorage if available
    this.loadSavedState();
    
    console.log('Valentine\'s Day Configurator initialized');
  }

  setupEventListeners() {
    // Template selection
    if (this.options.showTemplates) {
      this.element.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const template = e.currentTarget.dataset.template;
          this.selectTemplate(template);
        });
      });
    }

    // Product slot management
    const addSlotBtn = this.element.querySelector(`#add-slot-${this.blockId}`);
    if (addSlotBtn) {
      addSlotBtn.addEventListener('click', () => this.addProductSlot());
    }

    // Gift wrapping toggle
    const giftWrapToggle = this.element.querySelector(`#gift-wrap-${this.blockId}`);
    if (giftWrapToggle) {
      giftWrapToggle.addEventListener('change', (e) => {
        this.toggleGiftWrap(e.target.checked);
      });
    }

    // Gift wrapping style selection
    this.element.querySelectorAll(`input[name="wrapping-${this.blockId}"]`).forEach(input => {
      input.addEventListener('change', (e) => {
        this.selectGiftWrapStyle(e.target.value);
      });
    });

    // Gift message input
    const giftMessageInput = this.element.querySelector(`#gift-message-${this.blockId}`);
    if (giftMessageInput) {
      giftMessageInput.addEventListener('input', (e) => {
        this.updateGiftMessage(e.target.value);
      });
    }

    // Discount code handling
    const discountButtons = this.element.querySelectorAll('.discount-code');
    discountButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.target.dataset.code;
        this.applyDiscountCode(code);
      });
    });

    const applyDiscountBtn = this.element.querySelector(`#apply-discount-${this.blockId}`);
    const discountInput = this.element.querySelector(`#discount-code-${this.blockId}`);
    
    if (applyDiscountBtn && discountInput) {
      applyDiscountBtn.addEventListener('click', () => {
        this.applyDiscountCode(discountInput.value);
      });
      
      discountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyDiscountCode(e.target.value);
        }
      });
    }

    // Add to cart button
    const addToCartBtn = this.element.querySelector(`#add-bundle-${this.blockId}`);
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addBundleToCart());
    }
  }

  setupTemplates() {
    // Define Valentine's Day templates
    this.templates = {
      'his-hers': {
        name: 'His & Hers Set',
        description: 'Matching couple jewelry',
        products: [
          { name: 'Promise Ring (His)', price: 149.99, type: 'ring' },
          { name: 'Promise Ring (Hers)', price: 149.99, type: 'ring' }
        ],
        basePrice: 299.98
      },
      'engagement': {
        name: 'Engagement Dream',
        description: 'Ring + romantic necklace',
        products: [
          { name: 'Diamond Engagement Ring', price: 1499.99, type: 'ring' },
          { name: 'Heart Pendant Necklace', price: 899.99, type: 'necklace' }
        ],
        basePrice: 2399.98
      },
      'surprise': {
        name: 'Surprise Bundle',
        description: 'Earrings + promise ring',
        products: [
          { name: 'Love Knot Earrings', price: 599.99, type: 'earrings' },
          { name: 'Promise Ring Set', price: 299.99, type: 'ring' }
        ],
        basePrice: 899.98
      }
    };
  }

  selectTemplate(templateId) {
    const template = this.templates[templateId];
    if (!template) return;

    // Clear current selection
    this.state.selectedProducts = [];
    
    // Apply template products
    this.state.selectedTemplate = templateId;
    this.state.selectedProducts = [...template.products];

    // Update UI
    this.updateTemplateUI(templateId);
    this.updateProductGrid();
    this.updateBundleSummary();
    this.updatePricing();
    
    this.saveState();
  }

  updateTemplateUI(templateId) {
    // Remove previous selections
    this.element.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Highlight selected template
    const selectedCard = this.element.querySelector(`[data-template="${templateId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
  }

  addProductSlot() {
    if (this.state.selectedProducts.length >= this.options.maxProducts) {
      this.showNotification('Maximum number of products reached', 'warning');
      return;
    }

    const productGrid = this.element.querySelector(`#product-grid-${this.blockId}`);
    if (!productGrid) return;

    const slotIndex = this.state.selectedProducts.length + 1;
    const slotElement = this.createProductSlot(slotIndex);
    
    productGrid.appendChild(slotElement);
    this.updateAddSlotButton();
  }

  createProductSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'product-slot';
    slot.dataset.slot = index;
    
    slot.innerHTML = `
      <div class="product-slot__placeholder">
        <div class="product-slot__icon">➕</div>
        <p>Select Product ${index}</p>
        <button class="product-selector-btn" data-slot="${index}">
          Choose Product
        </button>
      </div>
    `;

    // Add event listener for product selection
    const selectorBtn = slot.querySelector('.product-selector-btn');
    selectorBtn.addEventListener('click', () => this.openProductSelector(index));

    return slot;
  }

  openProductSelector(slotIndex) {
    // In a real implementation, this would open a product selection modal
    // For demo purposes, we'll simulate product selection
    this.simulateProductSelection(slotIndex);
  }

  simulateProductSelection(slotIndex) {
    // Simulate available products
    const availableProducts = [
      { id: 1, name: 'Diamond Engagement Ring', price: 1499.99, image: '/path/to/ring.jpg', type: 'ring' },
      { id: 2, name: 'Heart Pendant Necklace', price: 899.99, image: '/path/to/necklace.jpg', type: 'necklace' },
      { id: 3, name: 'Love Knot Earrings', price: 599.99, image: '/path/to/earrings.jpg', type: 'earrings' },
      { id: 4, name: 'Promise Ring Set', price: 299.99, image: '/path/to/promise-ring.jpg', type: 'ring' },
      { id: 5, name: 'Romantic Bracelet', price: 399.99, image: '/path/to/bracelet.jpg', type: 'bracelet' }
    ];

    // For demo, randomly select a product
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    this.selectProduct(slotIndex, randomProduct);
  }

  selectProduct(slotIndex, product) {
    // Ensure we have enough slots in the array
    while (this.state.selectedProducts.length < slotIndex) {
      this.state.selectedProducts.push(null);
    }

    // Set the product at the specified index
    this.state.selectedProducts[slotIndex - 1] = product;

    // Update the UI
    this.updateProductSlot(slotIndex, product);
    this.updateBundleSummary();
    this.updatePricing();
    this.updateAddToCartButton();
    
    this.saveState();
  }

  updateProductSlot(slotIndex, product) {
    const slot = this.element.querySelector(`[data-slot="${slotIndex}"]`);
    if (!slot) return;

    slot.classList.add('filled');
    slot.innerHTML = `
      <div class="product-slot__content">
        <img src="${product.image || '/placeholder-product.jpg'}" alt="${product.name}" class="product-slot__image">
        <div class="product-slot__title">${product.name}</div>
        <div class="product-slot__price">$${product.price.toFixed(2)}</div>
        <button class="product-slot__remove" data-slot="${slotIndex}">✕</button>
      </div>
    `;

    // Add remove functionality
    const removeBtn = slot.querySelector('.product-slot__remove');
    removeBtn.addEventListener('click', () => this.removeProduct(slotIndex));
  }

  removeProduct(slotIndex) {
    this.state.selectedProducts[slotIndex - 1] = null;
    
    // Update UI
    const slot = this.element.querySelector(`[data-slot="${slotIndex}"]`);
    if (slot) {
      slot.classList.remove('filled');
      slot.innerHTML = `
        <div class="product-slot__placeholder">
          <div class="product-slot__icon">➕</div>
          <p>Select Product ${slotIndex}</p>
          <button class="product-selector-btn" data-slot="${slotIndex}">
            Choose Product
          </button>
        </div>
      `;

      // Re-add event listener
      const selectorBtn = slot.querySelector('.product-selector-btn');
      selectorBtn.addEventListener('click', () => this.openProductSelector(slotIndex));
    }

    this.updateBundleSummary();
    this.updatePricing();
    this.updateAddToCartButton();
    
    this.saveState();
  }

  toggleGiftWrap(enabled) {
    this.state.giftWrapping.enabled = enabled;
    
    const wrapOptions = this.element.querySelector(`#wrap-options-${this.blockId}`);
    if (wrapOptions) {
      wrapOptions.style.display = enabled ? 'block' : 'none';
    }

    if (!enabled) {
      this.state.giftWrapping.style = null;
      this.state.giftWrapping.message = '';
    }

    this.updatePricing();
    this.saveState();
  }

  selectGiftWrapStyle(style) {
    this.state.giftWrapping.style = style;
    this.updatePricing();
    this.saveState();
  }

  updateGiftMessage(message) {
    this.state.giftWrapping.message = message;
    this.saveState();
  }

  async applyDiscountCode(code) {
    if (!code.trim()) return;

    const discountInput = this.element.querySelector(`#discount-code-${this.blockId}`);
    const discountResult = this.element.querySelector(`#discount-result-${this.blockId}`);
    
    if (discountInput) discountInput.value = code;
    
    // Show loading state
    if (discountResult) {
      discountResult.innerHTML = 'Validating discount code...';
      discountResult.className = 'discount-result';
    }

    try {
      // Simulate API call to validate discount code
      const isValid = await this.validateDiscountCode(code);
      
      if (isValid) {
        this.state.discountCode = {
          code: code,
          isValid: true,
          discountAmount: isValid.amount,
          discountType: isValid.type
        };

        if (discountResult) {
          discountResult.innerHTML = `✅ Discount applied: ${isValid.description}`;
          discountResult.className = 'discount-result success';
        }
      } else {
        this.state.discountCode = {
          code: '',
          isValid: false,
          discountAmount: 0,
          discountType: 'percentage'
        };

        if (discountResult) {
          discountResult.innerHTML = '❌ Invalid discount code';
          discountResult.className = 'discount-result error';
        }
      }

      this.updatePricing();
      this.saveState();
      
    } catch (error) {
      console.error('Error validating discount code:', error);
      
      if (discountResult) {
        discountResult.innerHTML = '❌ Error validating discount code';
        discountResult.className = 'discount-result error';
      }
    }
  }

  async validateDiscountCode(code) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock discount codes for demo
    const discountCodes = {
      'VALENTINE20': { type: 'percentage', amount: 20, description: '20% off Valentine\'s products' },
      'LOVEBIRDS15': { type: 'percentage', amount: 15, description: '15% off couple\'s jewelry' },
      'CUPID50': { type: 'fixed', amount: 50, description: '$50 off orders over $200' },
      'SWEETHEART': { type: 'percentage', amount: 10, description: '10% off romantic gifts' }
    };

    return discountCodes[code.toUpperCase()] || false;
  }

  updateBundleSummary() {
    const summaryContent = this.element.querySelector(`#summary-${this.blockId}`);
    if (!summaryContent) return;

    const validProducts = this.state.selectedProducts.filter(product => product !== null);
    
    if (validProducts.length === 0) {
      summaryContent.innerHTML = '<p class="bundle-summary__empty">Add products to see your bundle summary</p>';
      return;
    }

    const bundleItems = validProducts.map(product => `
      <div class="bundle-item">
        <div class="bundle-item__info">
          <div class="bundle-item__name">${product.name}</div>
          <div class="bundle-item__details">${product.type}</div>
        </div>
        <div class="bundle-item__price">$${product.price.toFixed(2)}</div>
      </div>
    `).join('');

    summaryContent.innerHTML = bundleItems;
  }

  updatePricing() {
    const validProducts = this.state.selectedProducts.filter(product => product !== null);
    
    // Calculate subtotal
    this.state.pricing.subtotal = validProducts.reduce((sum, product) => sum + product.price, 0);

    // Calculate discount
    if (this.state.discountCode.isValid) {
      if (this.state.discountCode.discountType === 'percentage') {
        this.state.pricing.discountAmount = this.state.pricing.subtotal * (this.state.discountCode.discountAmount / 100);
      } else {
        this.state.pricing.discountAmount = this.state.discountCode.discountAmount;
      }
    } else {
      this.state.pricing.discountAmount = 0;
    }

    // Calculate gift wrap cost
    if (this.state.giftWrapping.enabled && this.state.giftWrapping.style) {
      const giftWrapPrices = {
        'classic-red': 5.99,
        'elegant-gold': 7.99,
        'romantic-pink': 6.99,
        'premium-velvet': 12.99
      };
      this.state.pricing.giftWrapCost = giftWrapPrices[this.state.giftWrapping.style] || 0;
    } else {
      this.state.pricing.giftWrapCost = 0;
    }

    // Calculate total
    this.state.pricing.total = this.state.pricing.subtotal - this.state.pricing.discountAmount + this.state.pricing.giftWrapCost;

    // Update UI
    this.updatePricingDisplay();
  }

  updatePricingDisplay() {
    const pricingElement = this.element.querySelector(`#pricing-${this.blockId}`);
    if (!pricingElement) return;

    const subtotalEl = pricingElement.querySelector('.subtotal');
    const discountEl = pricingElement.querySelector('.discount');
    const giftWrapEl = pricingElement.querySelector('.gift-wrap-cost');
    const totalEl = pricingElement.querySelector('.total');

    if (subtotalEl) subtotalEl.textContent = `$${this.state.pricing.subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${this.state.pricing.total.toFixed(2)}`;

    // Show/hide discount line
    const discountLine = pricingElement.querySelector('.discount-line');
    if (this.state.pricing.discountAmount > 0) {
      if (discountEl) discountEl.textContent = `-$${this.state.pricing.discountAmount.toFixed(2)}`;
      if (discountLine) discountLine.style.display = 'flex';
    } else {
      if (discountLine) discountLine.style.display = 'none';
    }

    // Show/hide gift wrap line
    const giftWrapLine = pricingElement.querySelector('.gift-wrap-line');
    if (this.state.pricing.giftWrapCost > 0) {
      if (giftWrapEl) giftWrapEl.textContent = `+$${this.state.pricing.giftWrapCost.toFixed(2)}`;
      if (giftWrapLine) giftWrapLine.style.display = 'flex';
    } else {
      if (giftWrapLine) giftWrapLine.style.display = 'none';
    }
  }

  updateAddToCartButton() {
    const addToCartBtn = this.element.querySelector(`#add-bundle-${this.blockId}`);
    if (!addToCartBtn) return;

    const validProducts = this.state.selectedProducts.filter(product => product !== null);
    const hasProducts = validProducts.length > 0;

    addToCartBtn.disabled = !hasProducts;
    
    if (hasProducts) {
      addToCartBtn.textContent = `💕 Add Bundle to Cart ($${this.state.pricing.total.toFixed(2)})`;
    } else {
      addToCartBtn.textContent = '💕 Add Bundle to Cart';
    }
  }

  updateAddSlotButton() {
    const addSlotBtn = this.element.querySelector(`#add-slot-${this.blockId}`);
    if (!addSlotBtn) return;

    const currentSlots = this.element.querySelectorAll('.product-slot').length;
    const isMaxReached = currentSlots >= this.options.maxProducts;

    addSlotBtn.disabled = isMaxReached;
    
    if (isMaxReached) {
      addSlotBtn.textContent = `Maximum ${this.options.maxProducts} products reached`;
    } else {
      addSlotBtn.textContent = `➕ Add Another Product (max ${this.options.maxProducts})`;
    }
  }

  updateTheme() {
    this.element.setAttribute('data-theme', this.options.valentineTheme);
  }

  async addBundleToCart() {
    const validProducts = this.state.selectedProducts.filter(product => product !== null);
    
    if (validProducts.length === 0) {
      this.showNotification('Please add products to your bundle first', 'error');
      return;
    }

    const addToCartBtn = this.element.querySelector(`#add-bundle-${this.blockId}`);
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Adding to Cart...';
    }

    try {
      // Prepare bundle data
      const bundleData = {
        products: validProducts.map(product => ({
          id: product.id,
          quantity: 1,
          properties: {
            '_bundle_id': this.generateBundleId(),
            '_bundle_name': 'Valentine\'s Bundle',
            '_is_bundle_item': 'true'
          }
        })),
        giftWrapping: this.state.giftWrapping,
        discountCode: this.state.discountCode.isValid ? this.state.discountCode.code : null,
        total: this.state.pricing.total
      };

      // Add to cart (simulated)
      const success = await this.submitBundleToCart(bundleData);
      
      if (success) {
        this.showNotification('Bundle added to cart successfully! 💕', 'success');
        
        // Track analytics
        this.trackBundleAddition(bundleData);
        
        // Optionally redirect to cart
        // window.location.href = '/cart';
      } else {
        throw new Error('Failed to add bundle to cart');
      }

    } catch (error) {
      console.error('Error adding bundle to cart:', error);
      this.showNotification('Failed to add bundle to cart. Please try again.', 'error');
    } finally {
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        this.updateAddToCartButton();
      }
    }
  }

  async submitBundleToCart(bundleData) {
    // Simulate API call to add bundle to cart
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, this would make a request to the cart API
    console.log('Bundle data to add to cart:', bundleData);
    
    // Simulate success (90% success rate for demo)
    return Math.random() > 0.1;
  }

  generateBundleId() {
    return 'valentine-bundle-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  trackBundleAddition(bundleData) {
    // Track analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: bundleData.total,
        items: bundleData.products.map(product => ({
          item_id: product.id,
          item_name: product.name,
          quantity: product.quantity,
          price: product.price
        }))
      });
    }

    // Track custom Valentine's bundle event
    if (this.options.enableAnalytics) {
      console.log('Valentine\'s bundle analytics:', {
        bundleType: this.state.selectedTemplate || 'custom',
        productCount: bundleData.products.length,
        total: bundleData.total,
        hasGiftWrap: bundleData.giftWrapping.enabled,
        hasDiscount: !!bundleData.discountCode
      });
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `valentine-notification valentine-notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out'
    });

    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  saveState() {
    try {
      const stateKey = `valentine-configurator-${this.blockId}`;
      localStorage.setItem(stateKey, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save configurator state:', error);
    }
  }

  loadSavedState() {
    try {
      const stateKey = `valentine-configurator-${this.blockId}`;
      const savedState = localStorage.getItem(stateKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.state = { ...this.state, ...parsedState };
        
        // Restore UI state
        this.restoreUIFromState();
      }
    } catch (error) {
      console.warn('Failed to load saved configurator state:', error);
    }
  }

  restoreUIFromState() {
    // Restore template selection
    if (this.state.selectedTemplate) {
      this.updateTemplateUI(this.state.selectedTemplate);
    }

    // Restore product selections
    this.state.selectedProducts.forEach((product, index) => {
      if (product) {
        this.updateProductSlot(index + 1, product);
      }
    });

    // Restore gift wrapping
    if (this.state.giftWrapping.enabled) {
      const giftWrapToggle = this.element.querySelector(`#gift-wrap-${this.blockId}`);
      if (giftWrapToggle) {
        giftWrapToggle.checked = true;
        this.toggleGiftWrap(true);
      }

      if (this.state.giftWrapping.style) {
        const styleInput = this.element.querySelector(`input[value="${this.state.giftWrapping.style}"]`);
        if (styleInput) styleInput.checked = true;
      }
    }

    // Restore gift message
    if (this.state.giftWrapping.message) {
      const messageInput = this.element.querySelector(`#gift-message-${this.blockId}`);
      if (messageInput) messageInput.value = this.state.giftWrapping.message;
    }

    // Restore discount code
    if (this.state.discountCode.isValid) {
      const discountInput = this.element.querySelector(`#discount-code-${this.blockId}`);
      if (discountInput) discountInput.value = this.state.discountCode.code;
    }

    // Update all displays
    this.updateBundleSummary();
    this.updatePricing();
    this.updateAddToCartButton();
  }

  loadProducts() {
    // In a real implementation, this would load products from Shopify API
    console.log('Loading products for configurator...');
  }
}

// Make the class globally available
window.ValentineConfigurator = ValentineConfigurator;

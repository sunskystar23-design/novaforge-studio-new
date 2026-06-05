const platformOptions = ['All Platforms', 'TikTok', 'Shopee', 'Lazada'];
const targetOptions = ['All', 'High Commission', 'High Profit', 'Best Seller', 'Trending', 'New Arrival'];
const maxSelectedProducts = 10;

const discoveryProducts = [
  {
    id: 'pcc-001',
    platform: 'TikTok',
    target: ['High Commission', 'Trending'],
    name: 'Wireless Lavalier Mic Pro',
    price: '฿590',
    commission: '18%',
    totalSales: '12.4K',
    thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pcc-002',
    platform: 'Shopee',
    target: ['Best Seller', 'High Profit'],
    name: 'Smart LED Sunset Lamp',
    price: '฿249',
    commission: '12%',
    totalSales: '48.1K',
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pcc-003',
    platform: 'Lazada',
    target: ['New Arrival', 'High Profit'],
    name: 'Portable Mini Blender',
    price: '฿799',
    commission: '15%',
    totalSales: '6.8K',
    thumbnail: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pcc-004',
    platform: 'TikTok',
    target: ['Best Seller', 'High Commission'],
    name: 'Magnetic Phone Cooler',
    price: '฿459',
    commission: '20%',
    totalSales: '21.7K',
    thumbnail: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pcc-005',
    platform: 'Shopee',
    target: ['Trending', 'New Arrival'],
    name: 'Foldable Travel Organizer',
    price: '฿189',
    commission: '10%',
    totalSales: '15.9K',
    thumbnail: 'https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'pcc-006',
    platform: 'Lazada',
    target: ['High Commission', 'Best Seller'],
    name: 'Automatic Soap Dispenser',
    price: '฿329',
    commission: '17%',
    totalSales: '31.2K',
    thumbnail: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
  },
];

let activeTab = 'auto';
let platformFilter = 'All Platforms';
let targetFilter = 'All';
let importLinks = Array.from({ length: 10 }, () => '');
let selectedProducts = [];

function detectPlatform(url) {
  const normalizedUrl = url.toLowerCase();

  if (!normalizedUrl.trim()) return '';
  if (normalizedUrl.includes('tiktok')) return 'TikTok';
  if (normalizedUrl.includes('shopee')) return 'Shopee';
  if (normalizedUrl.includes('lazada')) return 'Lazada';
  return 'Unknown';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getFilteredProducts() {
  return discoveryProducts.filter((product) => {
    const matchesPlatform = platformFilter === 'All Platforms' || product.platform === platformFilter;
    const matchesTarget = targetFilter === 'All' || product.target.includes(targetFilter);

    return matchesPlatform && matchesTarget;
  });
}

function renderOptions(options, selectedValue) {
  return options
    .map((option) => `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`)
    .join('');
}

function renderImportLinks() {
  if (activeTab !== 'import') return '';

  const rows = importLinks
    .map((link, index) => {
      const detectedPlatform = detectPlatform(link);
      const badge = detectedPlatform
        ? `<span class="platform-badge ${detectedPlatform.toLowerCase()}">${escapeHtml(detectedPlatform)}</span>`
        : '';

      return `
        <div class="link-row">
          <input
            aria-label="Product URL ${index + 1}"
            data-link-index="${index}"
            placeholder="Product URL ${index + 1}"
            type="url"
            value="${escapeHtml(link)}"
          />
          ${badge}
        </div>
      `;
    })
    .join('');

  return `<section class="import-panel" aria-label="Import product links">${rows}</section>`;
}

function renderDiscoveryResults() {
  const filteredProducts = getFilteredProducts();
  const productCards = filteredProducts
    .map((product) => {
      const isSelected = selectedProducts.some((selectedProduct) => selectedProduct.id === product.id);

      return `
        <button class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}" type="button">
          <img alt="" src="${escapeHtml(product.thumbnail)}" />
          <div class="product-info">
            <h3>${escapeHtml(product.name)}</h3>
            <div class="product-metrics">
              <span>${escapeHtml(product.price)}</span>
              <span>${escapeHtml(product.commission)}</span>
              <span>${escapeHtml(product.totalSales)} sales</span>
            </div>
          </div>
        </button>
      `;
    })
    .join('');

  return `
    <section class="results-section">
      <div class="section-heading">
        <h2>Discovery Results</h2>
        <span>${filteredProducts.length} products</span>
      </div>
      <div class="product-grid">${productCards}</div>
    </section>
  `;
}

function renderSelectedProducts() {
  const emptyState = selectedProducts.length === 0 ? '<p class="empty-state">Select products to build your queue.</p>' : '';
  const selectedCards = selectedProducts
    .map(
      (product) => `
        <article class="selected-card">
          <img alt="" src="${escapeHtml(product.thumbnail)}" />
          <div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.price)}</p>
          </div>
          <button aria-label="Remove ${escapeHtml(product.name)}" data-remove-product-id="${product.id}" type="button">
            <span aria-hidden="true">×</span>
          </button>
        </article>
      `,
    )
    .join('');

  return `
    <aside class="selected-panel" aria-label="Selected Products">
      <div class="section-heading">
        <h2>Selected Products</h2>
        <span>${selectedProducts.length}/${maxSelectedProducts}</span>
      </div>
      <div class="selected-list">${emptyState}${selectedCards}</div>
      <button class="send-button" ${selectedProducts.length === 0 ? 'disabled' : ''} id="send-to-content" type="button">
        🚀 Send To Content Generator
      </button>
    </aside>
  `;
}

function renderProductCommandCenter() {
  return `
    <main class="page-shell">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Product Discovery</p>
          <h1>🎯 Product Command Center</h1>
          <p class="description">ค้นหาและคัดเลือกสินค้าที่ต้องการนำไปสร้างคอนเทนต์</p>
        </div>
      </section>

      <section class="filter-bar" aria-label="Product filters">
        <label>
          <span>Platform</span>
          <select id="platform-filter">${renderOptions(platformOptions, platformFilter)}</select>
        </label>
        <label>
          <span>Target</span>
          <select id="target-filter">${renderOptions(targetOptions, targetFilter)}</select>
        </label>
      </section>

      <section class="workspace-grid">
        <div class="primary-column">
          <div class="tabs" role="tablist" aria-label="Product source tabs">
            <button class="${activeTab === 'auto' ? 'active' : ''}" data-tab="auto" type="button">Auto Discovery</button>
            <button class="${activeTab === 'import' ? 'active' : ''}" data-tab="import" type="button">Import Links</button>
          </div>
          ${renderImportLinks()}
          ${renderDiscoveryResults()}
        </div>
        ${renderSelectedProducts()}
      </section>
    </main>
  `;
}

function renderContentGeneratorLanding() {
  const selectedProductsPayload = JSON.parse(sessionStorage.getItem('selectedProducts') || '[]');

  return `
    <main class="page-shell content-landing">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Content Generator</p>
          <h1>Products Ready</h1>
          <p class="description">Received ${selectedProductsPayload.length} selectedProducts[] item(s).</p>
        </div>
      </section>
      <a class="back-link" href="../">Back to Product Command Center</a>
    </main>
  `;
}

function attachProductCommandCenterEvents() {
  document.querySelector('#platform-filter')?.addEventListener('change', (event) => {
    platformFilter = event.target.value;
    render();
  });

  document.querySelector('#target-filter')?.addEventListener('change', (event) => {
    targetFilter = event.target.value;
    render();
  });

  document.querySelectorAll('[data-tab]').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      activeTab = tabButton.dataset.tab;
      render();
    });
  });

  document.querySelectorAll('[data-link-index]').forEach((input) => {
    input.addEventListener('input', (event) => {
      importLinks[Number(input.dataset.linkIndex)] = event.target.value;
      render();
      const nextInput = document.querySelector(`[data-link-index="${input.dataset.linkIndex}"]`);
      nextInput?.focus();
      nextInput?.setSelectionRange(event.target.value.length, event.target.value.length);
    });
  });

  document.querySelectorAll('[data-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const product = discoveryProducts.find((item) => item.id === card.dataset.productId);
      const isSelected = selectedProducts.some((selectedProduct) => selectedProduct.id === product.id);

      if (isSelected) {
        selectedProducts = selectedProducts.filter((selectedProduct) => selectedProduct.id !== product.id);
      } else if (selectedProducts.length < maxSelectedProducts) {
        selectedProducts = [...selectedProducts, product];
      }

      render();
    });
  });

  document.querySelectorAll('[data-remove-product-id]').forEach((removeButton) => {
    removeButton.addEventListener('click', () => {
      selectedProducts = selectedProducts.filter((product) => product.id !== removeButton.dataset.removeProductId);
      render();
    });
  });

  document.querySelector('#send-to-content')?.addEventListener('click', () => {
    const selectedProductsPayload = selectedProducts.map(({ id, name, price, thumbnail, platform }) => ({
      id,
      name,
      price,
      thumbnail,
      platform,
    }));

    sessionStorage.setItem('selectedProducts', JSON.stringify(selectedProductsPayload));
    window.location.href = 'content-generator/';
  });
}

function render() {
  const root = document.querySelector('#root');

  if (window.location.pathname.replace(/\/$/, '').endsWith('/content-generator')) {
    root.innerHTML = renderContentGeneratorLanding();
    return;
  }

  root.innerHTML = renderProductCommandCenter();
  attachProductCommandCenterEvents();
}

render();

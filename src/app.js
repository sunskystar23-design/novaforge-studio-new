const maxSelectedProducts = 10;
const productStorageKey = 'selectedProducts';
const platformOptions = ['All Platforms', 'TikTok', 'Shopee', 'Lazada'];
const targetOptions = ['All', 'High Commission', 'High Profit', 'Best Seller', 'Trending', 'New Arrival'];
const importLinks = Array.from({ length: maxSelectedProducts }, () => '');

let activeTab = 'auto';
let platformFilter = 'All Platforms';
let targetFilter = 'All';
let keywordFilter = '';
let selectedProducts = readSelectedProducts();

function platformImage(platform, title = 'Product Preview') {
  const colors = {
    'TikTok Shop': ['#111827', '#22d3ee'],
    TikTok: ['#111827', '#22d3ee'],
    Shopee: ['#ee4d2d', '#fff0e8'],
    Lazada: ['#2636d9', '#edf0ff'],
    Unsupported: ['#64748b', '#e2e8f0'],
  };
  const [primary, secondary] = colors[platform] || colors.Unsupported;
  const safePlatform = escapeSvg(platform);
  const safeTitle = escapeSvg(title.slice(0, 28));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <rect width="640" height="420" rx="42" fill="${secondary}"/>
      <circle cx="500" cy="84" r="112" fill="${primary}" opacity="0.16"/>
      <rect x="70" y="92" width="500" height="236" rx="34" fill="white" opacity="0.86"/>
      <text x="320" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="${primary}">${safePlatform}</text>
      <text x="320" y="246" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#64748b">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createProduct(id, platform, title, price, commission, totalSales, targetTags, sourceUrl) {
  return normalizeProduct({
    id,
    platform,
    title,
    image: platformImage(platform, title),
    price,
    commission,
    totalSales,
    targetTags,
    sourceUrl,
    rawSource: {
      provider: 'Local Product Dataset Preview',
      targetTags,
    },
    supported: true,
  });
}

const discoveryProducts = [
  createProduct('tt-001', 'TikTok', 'Wireless Lavalier Mic Pro', '฿590', '18%', '12.4K', ['High Commission', 'Trending'], 'https://shop.tiktok.com/view/product/tt-001'),
  createProduct('tt-002', 'TikTok', 'Magnetic Phone Cooler', '฿459', '20%', '21.7K', ['High Commission', 'Best Seller'], 'https://shop.tiktok.com/view/product/tt-002'),
  createProduct('tt-003', 'TikTok', 'LED Makeup Mirror Travel Size', '฿329', '14%', '9.8K', ['Trending', 'New Arrival'], 'https://shop.tiktok.com/view/product/tt-003'),
  createProduct('tt-004', 'TikTok', 'Viral Hair Styling Brush', '฿699', '16%', '34.2K', ['Best Seller', 'High Profit'], 'https://shop.tiktok.com/view/product/tt-004'),
  createProduct('tt-005', 'TikTok', 'Portable Smoothie Blender', '฿799', '15%', '8.6K', ['High Profit', 'New Arrival'], 'https://shop.tiktok.com/view/product/tt-005'),
  createProduct('tt-006', 'TikTok', 'Mini Tripod Creator Kit', '฿389', '17%', '18.1K', ['High Commission', 'Trending'], 'https://shop.tiktok.com/view/product/tt-006'),
  createProduct('tt-007', 'TikTok', 'Pet Grooming Vacuum Brush', '฿1,290', '13%', '5.5K', ['High Profit', 'Trending'], 'https://shop.tiktok.com/view/product/tt-007'),
  createProduct('tt-008', 'TikTok', 'Desk RGB Light Bar', '฿549', '12%', '13.9K', ['Best Seller', 'Trending'], 'https://shop.tiktok.com/view/product/tt-008'),
  createProduct('tt-009', 'TikTok', 'Foldable Phone Gimbal', '฿1,590', '19%', '3.4K', ['High Commission', 'High Profit'], 'https://shop.tiktok.com/view/product/tt-009'),
  createProduct('tt-010', 'TikTok', 'Cooling Sunscreen Mist', '฿259', '11%', '26.8K', ['Best Seller', 'New Arrival'], 'https://shop.tiktok.com/view/product/tt-010'),
  createProduct('sp-001', 'Shopee', 'Smart LED Sunset Lamp', '฿249', '12%', '48.1K', ['Best Seller', 'High Profit'], 'https://shopee.co.th/product/sp-001'),
  createProduct('sp-002', 'Shopee', 'Foldable Travel Organizer', '฿189', '10%', '15.9K', ['Trending', 'New Arrival'], 'https://shopee.co.th/product/sp-002'),
  createProduct('sp-003', 'Shopee', 'Automatic Soap Dispenser', '฿329', '17%', '31.2K', ['High Commission', 'Best Seller'], 'https://shopee.co.th/product/sp-003'),
  createProduct('sp-004', 'Shopee', 'Ergonomic Laptop Stand', '฿399', '9%', '19.6K', ['Best Seller', 'High Profit'], 'https://shopee.co.th/product/sp-004'),
  createProduct('sp-005', 'Shopee', 'Reusable Kitchen Oil Spray', '฿129', '8%', '52.7K', ['Best Seller', 'Trending'], 'https://shopee.co.th/product/sp-005'),
  createProduct('sp-006', 'Shopee', 'Cordless Mini Vacuum', '฿899', '16%', '11.3K', ['High Commission', 'High Profit'], 'https://shopee.co.th/product/sp-006'),
  createProduct('sp-007', 'Shopee', 'Compression Packing Cubes', '฿299', '10%', '22.4K', ['Trending', 'Best Seller'], 'https://shopee.co.th/product/sp-007'),
  createProduct('sp-008', 'Shopee', 'Rechargeable Mosquito Swatter', '฿219', '13%', '28.5K', ['High Commission', 'Best Seller'], 'https://shopee.co.th/product/sp-008'),
  createProduct('sp-009', 'Shopee', 'Ceramic Nonstick Fry Pan', '฿699', '12%', '7.4K', ['High Profit', 'New Arrival'], 'https://shopee.co.th/product/sp-009'),
  createProduct('sp-010', 'Shopee', 'Wireless Charging Alarm Clock', '฿549', '14%', '9.1K', ['New Arrival', 'Trending'], 'https://shopee.co.th/product/sp-010'),
  createProduct('lz-001', 'Lazada', 'Portable Mini Blender', '฿799', '15%', '6.8K', ['New Arrival', 'High Profit'], 'https://www.lazada.co.th/products/lz-001.html'),
  createProduct('lz-002', 'Lazada', 'Air Fryer Digital 5L', '฿1,990', '10%', '14.2K', ['Best Seller', 'High Profit'], 'https://www.lazada.co.th/products/lz-002.html'),
  createProduct('lz-003', 'Lazada', 'Robot Vacuum Slim Pro', '฿3,990', '12%', '4.7K', ['High Profit', 'Trending'], 'https://www.lazada.co.th/products/lz-003.html'),
  createProduct('lz-004', 'Lazada', 'Water Flosser Portable', '฿899', '18%', '10.8K', ['High Commission', 'Trending'], 'https://www.lazada.co.th/products/lz-004.html'),
  createProduct('lz-005', 'Lazada', 'Noise Cancelling Earbuds', '฿1,290', '16%', '18.9K', ['High Commission', 'Best Seller'], 'https://www.lazada.co.th/products/lz-005.html'),
  createProduct('lz-006', 'Lazada', 'Smart Body Weight Scale', '฿499', '11%', '20.2K', ['Best Seller', 'New Arrival'], 'https://www.lazada.co.th/products/lz-006.html'),
  createProduct('lz-007', 'Lazada', 'Electric Neck Massager', '฿1,190', '15%', '8.3K', ['High Profit', 'Trending'], 'https://www.lazada.co.th/products/lz-007.html'),
  createProduct('lz-008', 'Lazada', 'Car Dash Camera 4K', '฿1,790', '13%', '5.9K', ['High Profit', 'New Arrival'], 'https://www.lazada.co.th/products/lz-008.html'),
  createProduct('lz-009', 'Lazada', 'Stainless Lunch Box Set', '฿359', '9%', '16.5K', ['Best Seller', 'Trending'], 'https://www.lazada.co.th/products/lz-009.html'),
  createProduct('lz-010', 'Lazada', 'Home Security WiFi Camera', '฿699', '17%', '25.1K', ['High Commission', 'Best Seller'], 'https://www.lazada.co.th/products/lz-010.html'),
];

const productDataSourceConnectors = {
  TikTok: createLocalPreviewConnector('TikTok', 'TikTok Shop data provider'),
  Shopee: createLocalPreviewConnector('Shopee', 'Shopee affiliate/product API'),
  Lazada: createLocalPreviewConnector('Lazada', 'Lazada affiliate/product API'),
};

// TODO: Replace the local preview connector with backend API calls when real providers are available.
// TODO: Kalodata API integration should live behind server/API endpoints, never direct browser scraping.
// TODO: TikTok Shop data provider credentials and requests should be handled by a backend connector.
// TODO: Shopee affiliate/product API credentials and requests should be handled by a backend connector.
// TODO: Lazada affiliate/product API credentials and requests should be handled by a backend connector.
function createLocalPreviewConnector(platform, providerTodo) {
  return {
    platform,
    providerTodo,
    sourceLabel: 'Local Product Dataset Preview',
    searchProducts({ target, keyword }) {
      return filterLocalPreviewProducts(platform, target, keyword);
    },
    importProductByUrl(url) {
      return extractProductFromUrl(url, importLinks.indexOf(url));
    },
    normalizeProduct,
  };
}

function searchProducts(platform, target, keyword) {
  const platforms = platform === 'All Platforms' ? ['TikTok', 'Shopee', 'Lazada'] : [platform];

  return platforms.flatMap((platformName) => {
    const connector = productDataSourceConnectors[platformName];
    if (!connector) return [];
    return connector.searchProducts({ target, keyword });
  });
}

function importProductByUrl(url) {
  const platform = detectPlatform(url);
  const connectorPlatform = platform === 'TikTok Shop' ? 'TikTok' : platform;
  const connector = productDataSourceConnectors[connectorPlatform];

  if (!connector) return extractProductFromUrl(url, importLinks.indexOf(url));
  return connector.importProductByUrl(url);
}

function filterLocalPreviewProducts(platform, target, keyword) {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();

  return discoveryProducts.filter((product) => {
    const matchesPlatform = product.platform === platform;
    const matchesTarget = target === 'All' || product.targetTags.includes(target);
    const matchesKeyword = !normalizedKeyword || [product.title, product.platform, product.price, product.commission, product.totalSales, product.sourceUrl]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword);

    return matchesPlatform && matchesTarget && matchesKeyword;
  });
}

function detectPlatform(url) {
  const normalizedUrl = url.toLowerCase();

  if (!normalizedUrl.trim()) return '';
  if (normalizedUrl.includes('tiktok')) return 'TikTok Shop';
  if (normalizedUrl.includes('shopee')) return 'Shopee';
  if (normalizedUrl.includes('lazada')) return 'Lazada';
  return 'Unsupported';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeSvg(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function readSelectedProducts() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(productStorageKey) || '[]');
    return Array.isArray(savedProducts) ? savedProducts.slice(0, maxSelectedProducts) : [];
  } catch {
    return [];
  }
}

function saveSelectedProducts() {
  localStorage.setItem(productStorageKey, JSON.stringify(selectedProducts.slice(0, maxSelectedProducts)));
}

function getUrlObject(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getQueryValue(urlObject, keys) {
  return keys.map((key) => urlObject.searchParams.get(key)).find(Boolean) || '';
}

function cleanTitleSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\.(html?|php)$/i, '')
    .replace(/\bi\d+\b/gi, '')
    .replace(/\b\d{5,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFromPath(urlObject, platform) {
  const titleCandidate = urlObject.pathname
    .split('/')
    .filter(Boolean)
    .map(cleanTitleSegment)
    .filter((segment) => segment && !['product', 'products', 'item', 'shop', 'mall', 'p'].includes(segment.toLowerCase()))
    .sort((first, second) => second.length - first.length)[0];

  return titleCandidate || `${platform} Product`;
}

function normalizeProduct(rawProduct) {
  const sourceUrl = rawProduct.sourceUrl || rawProduct.productUrl || '';

  return {
    id: rawProduct.id,
    platform: rawProduct.platform,
    title: rawProduct.title,
    image: rawProduct.image || platformImage(rawProduct.platform, rawProduct.title),
    price: rawProduct.price || 'Price unavailable',
    commission: rawProduct.commission || 'N/A',
    totalSales: rawProduct.totalSales || 'N/A',
    sourceUrl,
    rawSource: rawProduct.rawSource || rawProduct,
    targetTags: rawProduct.targetTags || [],
    productUrl: sourceUrl,
    supported: rawProduct.supported !== false,
  };
}

function extractProductFromUrl(url, index) {
  const trimmedUrl = url.trim();
  const urlObject = getUrlObject(trimmedUrl);

  if (!trimmedUrl || !urlObject) return null;

  const platform = detectPlatform(trimmedUrl);
  if (platform === 'Unsupported') {
    return normalizeProduct({
      id: `unsupported-${index}-${trimmedUrl}`,
      title: 'Unsupported product URL',
      image: platformImage(platform),
      price: 'Price unavailable',
      commission: 'N/A',
      totalSales: 'N/A',
      platform,
      targetTags: [],
      sourceUrl: trimmedUrl,
      rawSource: { sourceUrl: trimmedUrl, supported: false },
      supported: false,
    });
  }

  const title = getQueryValue(urlObject, ['title', 'name', 'product_name', 'item_title']) || titleFromPath(urlObject, platform);
  const image = getQueryValue(urlObject, ['image', 'img', 'thumbnail', 'thumb', 'imageUrl', 'pic']) || platformImage(platform, title);
  const price = getQueryValue(urlObject, ['price', 'sale_price', 'amount', 'minPrice', 'current_price']) || 'Price unavailable';

  return normalizeProduct({
    id: `import-${platform}-${urlObject.hostname}-${urlObject.pathname}-${urlObject.search}`,
    title,
    image,
    price: price.startsWith('฿') || price === 'Price unavailable' ? price : `฿${price}`,
    commission: 'Imported',
    totalSales: 'Imported',
    platform,
    targetTags: ['Imported'],
    sourceUrl: trimmedUrl,
    rawSource: {
      sourceUrl: trimmedUrl,
      provider: 'URL Import Preview',
    },
    supported: true,
  });
}

function getImportedProducts() {
  return importLinks.map(importProductByUrl).filter(Boolean).slice(0, maxSelectedProducts);
}

function getDiscoveryResults() {
  return searchProducts(platformFilter, targetFilter, keywordFilter);
}

function isSelected(product) {
  return selectedProducts.some((selectedProduct) => selectedProduct.id === product.id);
}

function toggleProduct(product) {
  const normalizedProduct = normalizeProduct(product);

  if (!normalizedProduct.supported) return;

  if (isSelected(normalizedProduct)) {
    selectedProducts = selectedProducts.filter((selectedProduct) => selectedProduct.id !== normalizedProduct.id);
  } else if (selectedProducts.length < maxSelectedProducts) {
    selectedProducts = [...selectedProducts, normalizedProduct];
  }

  render();
}

function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter((product) => product.id !== productId);
  render();
}

function renderOptions(options, selectedValue) {
  return options
    .map((option) => `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`)
    .join('');
}

function renderDiscoveryFilters() {
  return `
    <section class="filter-bar discovery-filters" aria-label="Auto Discovery filters">
      <label>
        <span>Platform</span>
        <select id="platform-filter">${renderOptions(platformOptions, platformFilter)}</select>
      </label>
      <label>
        <span>Target</span>
        <select id="target-filter">${renderOptions(targetOptions, targetFilter)}</select>
      </label>
      <label>
        <span>Search Keyword</span>
        <input id="keyword-filter" placeholder="Search product name, platform or metrics" type="search" value="${escapeHtml(keywordFilter)}" />
      </label>
    </section>
  `;
}

function renderDiscoveryProductCard(product) {
  return `
    <button class="product-card ${isSelected(product) ? 'selected' : ''}" data-discovery-product-id="${escapeHtml(product.id)}" type="button">
      <img alt="" src="${escapeHtml(product.image)}" />
      <div class="product-info">
        <span class="platform-chip">${escapeHtml(product.platform)}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <div class="product-metrics">
          <span>${escapeHtml(product.price)}</span>
          <span>${escapeHtml(product.commission)} commission</span>
          <span>${escapeHtml(product.totalSales)} sales</span>
        </div>
      </div>
    </button>
  `;
}

function renderImportedProductCard(product) {
  return `
    <button class="product-card ${isSelected(product) ? 'selected' : ''} ${!product.supported ? 'disabled' : ''}" data-import-product-id="${escapeHtml(product.id)}" type="button">
      <img alt="" src="${escapeHtml(product.image)}" />
      <div class="product-info">
        <span class="platform-chip">${escapeHtml(product.platform)}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <div class="product-metrics">
          <span>${escapeHtml(product.price)}</span>
          <span class="source-url">${escapeHtml(product.sourceUrl)}</span>
        </div>
      </div>
    </button>
  `;
}

function renderImportLinks() {
  const rows = importLinks
    .map((link, index) => {
      const detectedPlatform = detectPlatform(link);
      const badge = detectedPlatform
        ? `<span class="platform-badge ${detectedPlatform.toLowerCase().replaceAll(' ', '-')}">${escapeHtml(detectedPlatform)}</span>`
        : '';

      return `
        <div class="link-row">
          <input
            aria-label="Product URL ${index + 1}"
            data-link-index="${index}"
            placeholder="Paste Shopee, TikTok Shop or Lazada URL ${index + 1}"
            type="url"
            value="${escapeHtml(link)}"
          />
          ${badge}
        </div>
      `;
    })
    .join('');

  return `
    <section class="import-panel" aria-label="Import product links">
      <div class="section-heading compact-heading">
        <h2>Import Links</h2>
        <span>${maxSelectedProducts} URLs max</span>
      </div>
      ${rows}
    </section>
  `;
}

function renderDiscoveryResults() {
  const products = activeTab === 'auto' ? getDiscoveryResults() : getImportedProducts();
  const heading = activeTab === 'auto' ? 'Discovery Results' : 'Imported Products';
  const emptyMessage = activeTab === 'auto'
    ? 'No products match the current local dataset filters.'
    : 'Paste product URLs above to extract products for selection.';
  const cards = activeTab === 'auto'
    ? products.map(renderDiscoveryProductCard).join('')
    : products.map(renderImportedProductCard).join('');
  const emptyState = products.length === 0 ? `<p class="empty-state">${emptyMessage}</p>` : '';

  return `
    <section class="results-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${activeTab === 'auto' ? 'Local Product Dataset Preview' : 'Manual Product Import'}</p>
          <h2>${heading}</h2>
          ${activeTab === 'auto' ? '<p class="source-label">Data Source: Local Preview Dataset</p>' : ''}
        </div>
        <span>${products.length} products</span>
      </div>
      <div class="product-grid">${emptyState}${cards}</div>
    </section>
  `;
}

function renderSelectedProducts() {
  const emptyState = selectedProducts.length === 0 ? '<p class="empty-state">Select products to build your queue.</p>' : '';
  const selectedCards = selectedProducts
    .map((product) => normalizeProduct(product))
    .map(
      (product) => `
        <article class="selected-card">
          <img alt="" src="${escapeHtml(product.image)}" />
          <div>
            <h3>${escapeHtml(product.title)}</h3>
            <p>${escapeHtml(product.price)}</p>
          </div>
          <button aria-label="Remove ${escapeHtml(product.title)}" data-remove-product-id="${escapeHtml(product.id)}" type="button">
            <span aria-hidden="true">×</span>
          </button>
        </article>
      `,
    )
    .join('');

  return `
    <aside class="selected-panel" aria-label="Selected Products Queue">
      <div class="section-heading">
        <h2>Selected Products Queue</h2>
        <span>${selectedProducts.length}/${maxSelectedProducts}</span>
      </div>
      <div class="selected-list">${emptyState}${selectedCards}</div>
      <button class="send-button" ${selectedProducts.length === 0 ? 'disabled' : ''} id="continue-to-content" type="button">
        Continue
      </button>
    </aside>
  `;
}

function renderProductCommandCenter() {
  return `
    <main class="page-shell">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Product Selection Workflow</p>
          <h1>🎯 Product Command Center</h1>
          <p class="description">ค้นหาและคัดเลือกสินค้าที่ต้องการนำไปสร้างคอนเทนต์</p>
        </div>
      </section>

      <section class="workspace-grid import-workspace">
        <div class="primary-column">
          <div class="tabs" role="tablist" aria-label="Product source tabs">
            <button class="${activeTab === 'auto' ? 'active' : ''}" data-tab="auto" type="button">Auto Discovery</button>
            <button class="${activeTab === 'import' ? 'active' : ''}" data-tab="import" type="button">Import Links</button>
          </div>
          ${activeTab === 'auto' ? renderDiscoveryFilters() : renderImportLinks()}
          ${renderDiscoveryResults()}
        </div>
        ${renderSelectedProducts()}
      </section>
    </main>
  `;
}

function renderContentGeneratorLanding() {
  const savedProducts = readSelectedProducts().map((product) => normalizeProduct(product));
  const productCards = savedProducts
    .map(
      (product) => `
        <article class="content-product-card">
          <img alt="" src="${escapeHtml(product.image)}" />
          <div>
            <span class="platform-chip">${escapeHtml(product.platform)}</span>
            <h3>${escapeHtml(product.title)}</h3>
            <p>${escapeHtml(product.price)}</p>
            <a class="source-url" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(product.sourceUrl)}</a>
          </div>
        </article>
      `,
    )
    .join('');
  const emptyState = savedProducts.length === 0 ? '<p class="empty-state">No selected products found. Go back and select products first.</p>' : '';

  return `
    <main class="page-shell content-landing">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Content Generator</p>
          <h1>Selected Products</h1>
          <p class="description">${savedProducts.length} product(s) ready for the next workflow step.</p>
        </div>
      </section>
      <section class="results-section">
        <div class="section-heading">
          <h2>Products From Product Command Center</h2>
          <span>${savedProducts.length}/${maxSelectedProducts}</span>
        </div>
        <div class="content-products-grid">${emptyState}${productCards}</div>
      </section>
      <a class="back-link" href="../">Back to Product Command Center</a>
    </main>
  `;
}

function attachProductCommandCenterEvents() {
  document.querySelectorAll('[data-tab]').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      activeTab = tabButton.dataset.tab;
      render();
    });
  });

  document.querySelector('#platform-filter')?.addEventListener('change', (event) => {
    platformFilter = event.target.value;
    render();
  });

  document.querySelector('#target-filter')?.addEventListener('change', (event) => {
    targetFilter = event.target.value;
    render();
  });

  document.querySelector('#keyword-filter')?.addEventListener('input', (event) => {
    keywordFilter = event.target.value;
    render();
    const keywordInput = document.querySelector('#keyword-filter');
    keywordInput?.focus();
    keywordInput?.setSelectionRange(event.target.value.length, event.target.value.length);
  });

  document.querySelectorAll('[data-link-index]').forEach((input) => {
    input.addEventListener('paste', (event) => {
      const pastedUrls = event.clipboardData
        .getData('text')
        .split(/\s+/)
        .map((value) => value.trim())
        .filter((value) => /^https?:\/\//i.test(value));

      if (pastedUrls.length <= 1) return;

      event.preventDefault();
      const startIndex = Number(input.dataset.linkIndex);
      pastedUrls.slice(0, maxSelectedProducts - startIndex).forEach((url, offset) => {
        importLinks[startIndex + offset] = url;
      });
      render();
    });

    input.addEventListener('input', (event) => {
      importLinks[Number(input.dataset.linkIndex)] = event.target.value;
      render();
      const nextInput = document.querySelector(`[data-link-index="${input.dataset.linkIndex}"]`);
      nextInput?.focus();
      nextInput?.setSelectionRange(event.target.value.length, event.target.value.length);
    });
  });

  document.querySelectorAll('[data-discovery-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const product = discoveryProducts.find((item) => item.id === card.dataset.discoveryProductId);
      if (product) toggleProduct(product);
    });
  });

  document.querySelectorAll('[data-import-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const product = getImportedProducts().find((item) => item.id === card.dataset.importProductId);
      if (product) toggleProduct(product);
    });
  });

  document.querySelectorAll('[data-remove-product-id]').forEach((removeButton) => {
    removeButton.addEventListener('click', () => removeSelectedProduct(removeButton.dataset.removeProductId));
  });

  document.querySelector('#continue-to-content')?.addEventListener('click', () => {
    saveSelectedProducts();
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

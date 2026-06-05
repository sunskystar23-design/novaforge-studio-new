const maxSelectedProducts = 10;
const productStorageKey = 'selectedProducts';
const importLinks = Array.from({ length: maxSelectedProducts }, () => '');
let selectedProducts = readSelectedProducts();

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

function formatPrice(value) {
  if (!value) return 'Price unavailable';
  const decodedValue = decodeURIComponent(value).replace(/[,+]/g, '').trim();
  const numericValue = decodedValue.match(/\d+(?:\.\d{1,2})?/);

  if (!numericValue) return decodedValue;
  if (/฿|thb|baht/i.test(decodedValue)) return `฿${numericValue[0]}`;
  return decodedValue.startsWith('$') ? `$${numericValue[0]}` : `฿${numericValue[0]}`;
}

function platformImage(platform) {
  const colors = {
    'TikTok Shop': ['#111827', '#22d3ee'],
    Shopee: ['#ee4d2d', '#fff0e8'],
    Lazada: ['#2636d9', '#edf0ff'],
    Unsupported: ['#64748b', '#e2e8f0'],
  };
  const [primary, secondary] = colors[platform] || colors.Unsupported;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <rect width="640" height="420" rx="42" fill="${secondary}"/>
      <circle cx="500" cy="84" r="112" fill="${primary}" opacity="0.16"/>
      <rect x="70" y="92" width="500" height="236" rx="34" fill="white" opacity="0.86"/>
      <text x="320" y="194" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="${primary}">${platform}</text>
      <text x="320" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#64748b">Product Preview</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function extractProductFromUrl(url, index) {
  const trimmedUrl = url.trim();
  const urlObject = getUrlObject(trimmedUrl);

  if (!trimmedUrl || !urlObject) return null;

  const platform = detectPlatform(trimmedUrl);
  if (platform === 'Unsupported') {
    return {
      id: `unsupported-${index}-${trimmedUrl}`,
      title: 'Unsupported product URL',
      image: platformImage(platform),
      price: 'Price unavailable',
      platform,
      productUrl: trimmedUrl,
      supported: false,
    };
  }

  const title = getQueryValue(urlObject, ['title', 'name', 'product_name', 'item_title']) || titleFromPath(urlObject, platform);
  const image = getQueryValue(urlObject, ['image', 'img', 'thumbnail', 'thumb', 'imageUrl', 'pic']) || platformImage(platform);
  const price = formatPrice(getQueryValue(urlObject, ['price', 'sale_price', 'amount', 'minPrice', 'current_price']));

  return {
    id: `${platform}-${urlObject.hostname}-${urlObject.pathname}-${urlObject.search}`,
    title,
    image,
    price,
    platform,
    productUrl: trimmedUrl,
    supported: true,
  };
}

function getImportedProducts() {
  return importLinks.map(extractProductFromUrl).filter(Boolean).slice(0, maxSelectedProducts);
}

function isSelected(product) {
  return selectedProducts.some((selectedProduct) => selectedProduct.id === product.id);
}

function toggleProduct(product) {
  if (!product.supported) return;

  if (isSelected(product)) {
    selectedProducts = selectedProducts.filter((selectedProduct) => selectedProduct.id !== product.id);
  } else if (selectedProducts.length < maxSelectedProducts) {
    selectedProducts = [...selectedProducts, product];
  }

  saveSelectedProducts();
  render();
}

function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter((product) => product.id !== productId);
  saveSelectedProducts();
  render();
}

function renderImportedProductCard(product) {
  return `
    <button class="product-card ${isSelected(product) ? 'selected' : ''} ${!product.supported ? 'disabled' : ''}" data-product-id="${escapeHtml(product.id)}" type="button">
      <img alt="" src="${escapeHtml(product.image)}" />
      <div class="product-info">
        <span class="platform-chip">${escapeHtml(product.platform)}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <div class="product-metrics">
          <span class="source-url">${escapeHtml(product.productUrl)}</span>
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
  const importedProducts = getImportedProducts();
  const emptyState = importedProducts.length === 0
    ? '<p class="empty-state">Paste product URLs above to extract products for selection.</p>'
    : '';

  return `
    <section class="results-section">
      <div class="section-heading">
        <h2>Imported Products</h2>
        <span>${importedProducts.length}/${maxSelectedProducts}</span>
      </div>
      <div class="product-grid">${emptyState}${importedProducts.map(renderImportedProductCard).join('')}</div>
    </section>
  `;
}

function renderSelectedProducts() {
  const emptyState = selectedProducts.length === 0 ? '<p class="empty-state">Select imported products to build your queue.</p>' : '';
  const selectedCards = selectedProducts
    .map(
      (product) => `
        <article class="selected-card">
          <img alt="" src="${escapeHtml(product.image)}" />
          <div>
            <span class="platform-chip">${escapeHtml(product.platform)}</span>
            <h3>${escapeHtml(product.title)}</h3>
            <p class="source-url">${escapeHtml(product.productUrl)}</p>
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
            <button class="active" type="button">Import Links</button>
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
  const savedProducts = readSelectedProducts();
  const productCards = savedProducts
    .map(
      (product) => `
        <article class="content-product-card">
          <img alt="" src="${escapeHtml(product.image)}" />
          <div>
            <span class="platform-chip">${escapeHtml(product.platform)}</span>
            <h3>${escapeHtml(product.title)}</h3>
            <a class="source-url" href="${escapeHtml(product.productUrl)}" target="_blank" rel="noreferrer">${escapeHtml(product.productUrl)}</a>
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

  document.querySelectorAll('[data-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const product = getImportedProducts().find((item) => item.id === card.dataset.productId);
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

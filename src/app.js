const maxSelectedProducts = 10;
const productStorageKey = 'selectedProducts';
const platformOptions = ['All Platforms', 'TikTok', 'Shopee', 'Lazada'];
const targetOptions = ['All', 'High Commission', 'High Profit', 'Best Seller', 'Trending', 'New Arrival'];
const importLinks = Array.from({ length: maxSelectedProducts }, () => '');
const appScriptUrl = (typeof document !== 'undefined' && document.currentScript?.src) || 'src/app.js';
const defaultDataSourceConfig = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  USE_SUPABASE: false,
};
let runtimeDataSourceConfig = { ...defaultDataSourceConfig };
const realDataSourceConfig = {
  status: 'not-connected',
  notice: 'Real Data Source Not Connected',
  providers: {
    kalodataApi: { label: 'Kalodata API', status: 'Not connected', endpoint: '' },
    tiktokShopProvider: { label: 'TikTok Shop data provider', status: 'Not connected', endpoint: '' },
    shopeeProductAffiliateApi: { label: 'Shopee product/affiliate API', status: 'Not connected', endpoint: '' },
    lazadaProductAffiliateApi: { label: 'Lazada product/affiliate API', status: 'Not connected', endpoint: '' },
    externalJsonDatabase: { label: 'External JSON database', status: 'Optional user-provided JSON feed', endpoint: '' },
    supabaseProductWarehouse: { label: 'Supabase Product Warehouse', status: 'Configured only when USE_SUPABASE is true', endpoint: '' },
  },
};

let activeTab = 'auto';
let platformFilter = 'All Platforms';
let targetFilter = 'All';
let keywordFilter = '';
let discoveryDataSource = 'local';
let externalJsonUrl = '';
let externalProducts = [];
let externalSourceStatus = 'idle';
let externalSourceError = '';
let externalFetchTimer;
let externalFetchRequestId = 0;
let supabaseProducts = [];
let supabaseSourceStatus = 'idle';
let supabaseSourceError = '';
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
  if (discoveryDataSource === 'supabase' && supabaseSourceStatus === 'ready') {
    return filterProducts(supabaseProducts, platform, target, keyword);
  }

  if (discoveryDataSource === 'external' && externalSourceStatus === 'ready') {
    return filterProducts(externalProducts, platform, target, keyword);
  }

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
  return filterProducts(discoveryProducts, platform, target, keyword, true);
}

function platformMatchesFilter(productPlatform, selectedPlatform) {
  return selectedPlatform === 'All Platforms' || productPlatform === selectedPlatform || (selectedPlatform === 'TikTok' && productPlatform === 'TikTok Shop');
}

function filterProducts(products, platform, target, keyword, platformAlreadyScoped = false) {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();

  return products.filter((product) => {
    const matchesPlatform = platformAlreadyScoped || platformMatchesFilter(product.platform, platform);
    const matchesTarget = target === 'All' || product.targetTags.includes(target);
    const matchesKeyword = !normalizedKeyword || [product.title, product.platform, product.price, product.commission, product.totalSales, product.sourceUrl]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword);

    return matchesPlatform && matchesTarget && matchesKeyword;
  });
}


function isSupabaseConfigured() {
  return Boolean(
    runtimeDataSourceConfig.USE_SUPABASE
    && runtimeDataSourceConfig.SUPABASE_URL
    && runtimeDataSourceConfig.SUPABASE_ANON_KEY
    && !runtimeDataSourceConfig.SUPABASE_URL.includes('YOUR_PROJECT_ID')
    && runtimeDataSourceConfig.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY',
  );
}

async function loadDataSourceConfig() {
  try {
    const configModuleUrl = new URL('dataSourceConfig.js', appScriptUrl).href;
    const configModule = await import(configModuleUrl);
    runtimeDataSourceConfig = {
      SUPABASE_URL: configModule.SUPABASE_URL || defaultDataSourceConfig.SUPABASE_URL,
      SUPABASE_ANON_KEY: configModule.SUPABASE_ANON_KEY || defaultDataSourceConfig.SUPABASE_ANON_KEY,
      USE_SUPABASE: Boolean(configModule.USE_SUPABASE),
    };
  } catch (error) {
    runtimeDataSourceConfig = { ...defaultDataSourceConfig };
    supabaseSourceError = `Supabase config could not be loaded: ${error.message}. Falling back to Local Preview Dataset.`;
  }

  if (runtimeDataSourceConfig.USE_SUPABASE) {
    discoveryDataSource = 'supabase';
    await fetchProductsFromSupabase();
  } else {
    render();
  }
}

function normalizeSupabaseProduct(row) {
  return normalizeProduct({
    id: row.id,
    platform: row.platform,
    title: row.title,
    image: row.image_url,
    price: row.price,
    commission: row.commission,
    totalSales: row.total_sales,
    targetTags: row.target_tags || [],
    sourceUrl: row.source_url,
    rawSource: {
      ...row,
      provider: 'Supabase Product Warehouse',
    },
    supported: true,
  });
}

async function fetchProductsFromSupabase() {
  supabaseSourceStatus = 'loading';
  supabaseSourceError = '';
  render();

  try {
    if (!isSupabaseConfigured()) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is missing, placeholder, or USE_SUPABASE is false');
    }

    const baseUrl = runtimeDataSourceConfig.SUPABASE_URL.replace(/\/$/, '');
    const selectColumns = 'id,platform,title,image_url,price,commission,total_sales,target_tags,source_url,data_source,fetched_at,created_at,updated_at';
    const requestUrl = `${baseUrl}/rest/v1/products?select=${encodeURIComponent(selectColumns)}&order=fetched_at.desc.nullslast,created_at.desc`;
    const response = await fetch(requestUrl, {
      headers: {
        apikey: runtimeDataSourceConfig.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${runtimeDataSourceConfig.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);

    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Supabase products response was not an array');

    supabaseProducts = rows.map(normalizeSupabaseProduct);
    supabaseSourceStatus = 'ready';
    supabaseSourceError = '';
  } catch (error) {
    supabaseProducts = [];
    supabaseSourceStatus = 'error';
    supabaseSourceError = `Supabase Product Warehouse failed: ${error.message}. Falling back to Local Preview Dataset.`;
  }

  render();
}

function getExternalProductArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeExternalProduct(rawProduct, index) {
  const platform = rawProduct.platform || rawProduct.marketplace || 'External';
  const title = rawProduct.title || rawProduct.name || rawProduct.productName || `External Product ${index + 1}`;
  const sourceUrl = rawProduct.sourceUrl || rawProduct.productUrl || rawProduct.url || '';
  const targetTags = rawProduct.targetTags || rawProduct.targets || rawProduct.tags || [];

  return normalizeProduct({
    id: rawProduct.id || `external-${index}-${sourceUrl || title}`,
    platform,
    title,
    image: rawProduct.image || rawProduct.thumbnail || rawProduct.imageUrl || platformImage(platform, title),
    price: rawProduct.price || rawProduct.salePrice || 'Price unavailable',
    commission: rawProduct.commission || rawProduct.commissionRate || 'N/A',
    totalSales: rawProduct.totalSales || rawProduct.sales || rawProduct.sold || 'N/A',
    targetTags: Array.isArray(targetTags) ? targetTags : [targetTags].filter(Boolean),
    sourceUrl,
    rawSource: rawProduct,
    supported: true,
  });
}

function scheduleExternalDatabaseFetch() {
  clearTimeout(externalFetchTimer);

  if (discoveryDataSource !== 'external') return;
  if (!externalJsonUrl.trim()) {
    externalProducts = [];
    externalSourceStatus = 'idle';
    externalSourceError = '';
    render();
    return;
  }

  externalSourceStatus = 'loading';
  externalSourceError = '';
  render();
  externalFetchTimer = setTimeout(loadExternalDatabase, 500);
}

async function loadExternalDatabase() {
  const requestId = ++externalFetchRequestId;
  const url = externalJsonUrl.trim();

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const rawProducts = getExternalProductArray(payload);
    if (rawProducts.length === 0) throw new Error('JSON must be an array or contain products/items/data array');

    if (requestId !== externalFetchRequestId) return;

    externalProducts = rawProducts.map(normalizeExternalProduct).slice(0, 200);
    externalSourceStatus = 'ready';
    externalSourceError = '';
  } catch (error) {
    if (requestId !== externalFetchRequestId) return;

    externalProducts = [];
    externalSourceStatus = 'error';
    externalSourceError = `External JSON Database failed: ${error.message}. Falling back to Local Preview Dataset.`;
  }

  render();
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

function productSelectionKey(product) {
  return product.id || product.sourceUrl || product.productUrl || product.title;
}

function dedupeProducts(products) {
  const seenProductKeys = new Set();

  return products
    .map((product) => normalizeProduct(product))
    .filter((product) => {
      const selectionKey = productSelectionKey(product);
      if (!selectionKey || seenProductKeys.has(selectionKey)) return false;
      seenProductKeys.add(selectionKey);
      return true;
    })
    .slice(0, maxSelectedProducts);
}

function readSelectedProducts() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(productStorageKey) || '[]');
    return Array.isArray(savedProducts) ? dedupeProducts(savedProducts) : [];
  } catch {
    return [];
  }
}

function saveSelectedProducts() {
  selectedProducts = dedupeProducts(selectedProducts);
  localStorage.setItem(productStorageKey, JSON.stringify(selectedProducts.slice(0, maxSelectedProducts)));
}

function syncSelectedProductsFromStorage() {
  selectedProducts = readSelectedProducts();
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
  const platform = rawProduct.platform || 'External';
  const title = rawProduct.title || 'Untitled Product';

  return {
    id: rawProduct.id || sourceUrl || `${platform}-${title}`,
    platform,
    title,
    image: rawProduct.image || platformImage(platform, title),
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
  const normalizedProduct = normalizeProduct(product);
  const selectionKey = productSelectionKey(normalizedProduct);

  return selectedProducts.some((selectedProduct) => productSelectionKey(selectedProduct) === selectionKey);
}

function toggleProduct(product) {
  const normalizedProduct = normalizeProduct(product);
  const selectionKey = productSelectionKey(normalizedProduct);

  if (!normalizedProduct.supported || !selectionKey) return;

  if (isSelected(normalizedProduct)) {
    selectedProducts = selectedProducts.filter((selectedProduct) => productSelectionKey(selectedProduct) !== selectionKey);
  } else if (selectedProducts.length < maxSelectedProducts) {
    selectedProducts = [...selectedProducts, normalizedProduct];
  }

  saveSelectedProducts();
  render();
}

function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter((product) => product.id !== productId);
  saveSelectedProducts();
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
        <span>Data Source</span>
        <select id="data-source-filter">
          <option value="local" ${discoveryDataSource === 'local' ? 'selected' : ''}>Local Preview Dataset</option>
          <option value="supabase" ${discoveryDataSource === 'supabase' ? 'selected' : ''}>Supabase Product Warehouse</option>
          <option value="external" ${discoveryDataSource === 'external' ? 'selected' : ''}>External JSON Database</option>
        </select>
      </label>
      <label>
        <span>External JSON Database URL</span>
        <input id="external-json-url" placeholder="https://example.com/products.json" type="url" value="${escapeHtml(externalJsonUrl)}" />
      </label>
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



function renderRealDataSourceSetupPanel() {
  if (activeTab !== 'auto') return '';

  const providerRows = Object.values(realDataSourceConfig.providers)
    .map(
      (provider) => `
        <tr>
          <td>${escapeHtml(provider.label)}</td>
          <td>${escapeHtml(provider.status)}</td>
          <td>${escapeHtml(provider.endpoint || 'Backend/API endpoint not configured')}</td>
        </tr>
      `,
    )
    .join('');

  return `
    <section class="real-source-panel" aria-label="Real Data Source Setup">
      <div>
        <p class="eyebrow">Real Data Source Setup</p>
        <h2>${isSupabasePrimaryActive() ? 'Supabase Product Warehouse Connected' : 'Real Data Source Not Connected'}</h2>
        <p class="source-label">${isSupabasePrimaryActive() ? 'Supabase is the active Product Command Center database source. Marketplace provider APIs still require backend sync jobs.' : 'Local preview remains the fallback. Real Shopee, TikTok and Lazada product data requires a backend/API connector or a prepared External JSON Database feed.'}</p>
      </div>
      <div class="data-source-table-wrap">
        <table class="data-source-table">
          <thead>
            <tr>
              <th>Future Source</th>
              <th>Status</th>
              <th>Configuration</th>
            </tr>
          </thead>
          <tbody>${providerRows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function isSupabasePrimaryActive() {
  return discoveryDataSource === 'supabase' && supabaseSourceStatus === 'ready';
}

function getDiscoverySourceLabel() {
  if (isSupabasePrimaryActive()) return 'Supabase Product Warehouse';
  if (discoveryDataSource === 'external' && externalSourceStatus === 'ready') return 'External JSON Database';
  return 'Local Preview Dataset';
}

function renderDataSourceStatusPanel() {
  if (activeTab !== 'auto') return '';

  const activeSourceName = getDiscoverySourceLabel();
  const activeSourceLabel = isSupabasePrimaryActive()
    ? `Supabase Product Warehouse (${supabaseProducts.length} products loaded)`
    : discoveryDataSource === 'external' && externalSourceStatus === 'ready'
      ? `External JSON Database (${externalProducts.length} products loaded)`
      : 'Local Preview Dataset';
  const sourceMessage = isSupabasePrimaryActive()
    ? 'Supabase Product Warehouse is connected and is the primary discovery source. Local Preview Dataset is available only as fallback if Supabase fails.'
    : discoveryDataSource === 'supabase'
      ? 'Supabase Product Warehouse is selected but not ready. Local Preview Dataset is used as fallback until Supabase loads successfully.'
      : discoveryDataSource === 'external'
        ? 'External JSON Database fetches product records from the provided JSON URL only. Marketplace APIs are still not connected and the frontend does not scrape marketplace pages.'
        : 'TikTok, Shopee and Lazada are using local mock records from src/app.js. Real platform APIs are not connected.';
  const errorMessage = [supabaseSourceError, externalSourceError]
    .filter(Boolean)
    .map((message) => `<p class="source-error">${escapeHtml(message)}</p>`)
    .join('');
  const loadingMessage = [
    supabaseSourceStatus === 'loading' ? 'Loading Supabase Product Warehouse…' : '',
    externalSourceStatus === 'loading' ? 'Loading External JSON Database…' : '',
  ]
    .filter(Boolean)
    .map((message) => `<p class="source-loading">${message}</p>`)
    .join('');

  const rows = [
    ['Supabase Product Warehouse', activeSourceName, isSupabasePrimaryActive() ? 'Connected' : 'Not connected / fallback active', 'Supabase products table via anon key'],
    ['TikTok Shop data provider', 'Backend sync required', 'Not connected', 'TikTok Shop / Kalodata / backend API'],
    ['Shopee product/affiliate API', 'Backend sync required', 'Not connected', 'Shopee Affiliate/Product API or backend API'],
    ['Lazada product/affiliate API', 'Backend sync required', 'Not connected', 'Lazada Affiliate/Product API or backend API'],
    ['Kalodata API', 'Backend sync required', 'Not connected', 'Kalodata / backend API'],
  ];

  return `
    <section class="data-source-panel" aria-label="Data Source Status">
      <div class="data-source-header">
        <div>
          <p class="eyebrow">Data Source Status</p>
          <h2>${escapeHtml(activeSourceLabel)}</h2>
          <p class="source-label">${escapeHtml(sourceMessage)}</p>
          ${loadingMessage}
          ${errorMessage}
        </div>
        <span class="local-preview-badge ${isSupabasePrimaryActive() ? 'connected' : ''}">${isSupabasePrimaryActive() ? 'SUPABASE PRODUCT WAREHOUSE ACTIVE' : 'LOCAL PREVIEW DATA — NOT LIVE PLATFORM DATA'}</span>
      </div>

      <div class="platform-status-grid" aria-label="Platform connector summary">
        <article>
          <h3>Supabase Product Warehouse</h3>
          <p>${isSupabasePrimaryActive() ? 'Connected' : 'Not connected / fallback active'}</p>
        </article>
        <article>
          <h3>TikTok Shop data provider</h3>
          <p>Not connected</p>
        </article>
        <article>
          <h3>Shopee product/affiliate API</h3>
          <p>Not connected</p>
        </article>
        <article>
          <h3>Lazada product/affiliate API</h3>
          <p>Not connected</p>
        </article>
        <article>
          <h3>Kalodata API</h3>
          <p>Not connected</p>
        </article>
      </div>

      <div class="data-source-table-wrap">
        <table class="data-source-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Current Role</th>
              <th>Status</th>
              <th>Required Integration</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                ([platform, currentSource, connectorStatus, requiredIntegration]) => `
                  <tr>
                    <td>${escapeHtml(platform)}</td>
                    <td>${escapeHtml(currentSource)}</td>
                    <td>${escapeHtml(connectorStatus)}</td>
                    <td>${escapeHtml(requiredIntegration)}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDiscoveryResults() {
  const products = activeTab === 'auto' ? getDiscoveryResults() : getImportedProducts();
  const heading = activeTab === 'auto' ? 'Discovery Results' : 'Imported Products';
  const discoverySourceLabel = getDiscoverySourceLabel();
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
          <p class="eyebrow">${activeTab === 'auto' ? discoverySourceLabel : 'Manual Product Import'}</p>
          <h2>${heading}</h2>
          ${activeTab === 'auto' ? `<p class="source-label">Data Source: ${discoverySourceLabel}${isSupabasePrimaryActive() ? ' (Primary)' : discoverySourceLabel === 'Local Preview Dataset' ? ' (Fallback / Preview)' : ''}</p>` : ''}
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
          ${renderRealDataSourceSetupPanel()}
          ${renderDataSourceStatusPanel()}
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

  document.querySelector('#data-source-filter')?.addEventListener('change', (event) => {
    discoveryDataSource = event.target.value;
    externalSourceError = '';
    supabaseSourceError = '';
    if (discoveryDataSource === 'external') {
      scheduleExternalDatabaseFetch();
    } else if (discoveryDataSource === 'supabase') {
      fetchProductsFromSupabase();
    } else {
      externalSourceStatus = 'idle';
      supabaseSourceStatus = 'idle';
      render();
    }
  });

  document.querySelector('#external-json-url')?.addEventListener('input', (event) => {
    externalJsonUrl = event.target.value;
    if (discoveryDataSource !== 'external') {
      discoveryDataSource = 'external';
    }
    scheduleExternalDatabaseFetch();
    const externalInput = document.querySelector('#external-json-url');
    externalInput?.focus();
    externalInput?.setSelectionRange(event.target.value.length, event.target.value.length);
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
      const product = getDiscoveryResults().find((item) => item.id === card.dataset.discoveryProductId);
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

  syncSelectedProductsFromStorage();
  root.innerHTML = renderProductCommandCenter();
  attachProductCommandCenterEvents();
}

window.addEventListener('pageshow', () => {
  syncSelectedProductsFromStorage();
  render();
});

render();
loadDataSourceConfig();

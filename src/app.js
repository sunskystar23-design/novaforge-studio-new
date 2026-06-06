const maxSelectedProducts = 10;
const productStorageKey = 'selectedProducts';
const imageWorkspaceStorageKey = 'contentGeneratorImageWorkspace';
const platformOptions = ['All Platforms', 'TikTok', 'Shopee', 'Lazada'];
const targetOptions = ['All', 'High Commission', 'High Profit', 'Best Seller', 'Trending', 'New Arrival'];
const csvImportColumns = ['platform', 'target', 'title', 'price', 'commission', 'sales', 'image_url', 'product_url'];
const supabaseImportChunkSize = 100;
const supabaseFetchPageSize = 1000;
const importLinks = Array.from({ length: maxSelectedProducts }, () => '');
const appScriptUrl = (typeof document !== 'undefined' && document.currentScript?.src) || 'src/app.js';
const defaultDataSourceConfig = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  USE_SUPABASE: false,
};
let runtimeDataSourceConfig = { ...defaultDataSourceConfig };
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
let supabaseConfigLoaded = false;
let supabaseConfigError = '';
let csvImportState = createCsvImportState();
let imageWorkspaceState = readImageWorkspaceState();
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


function getSupabaseUrlHost() {
  try {
    return new URL(runtimeDataSourceConfig.SUPABASE_URL).host;
  } catch {
    return runtimeDataSourceConfig.SUPABASE_URL || 'Not configured';
  }
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
    supabaseConfigLoaded = true;
    supabaseConfigError = '';
  } catch (error) {
    runtimeDataSourceConfig = { ...defaultDataSourceConfig };
    supabaseConfigLoaded = false;
    supabaseConfigError = `Supabase config could not be loaded: ${error.message}`;
    supabaseSourceError = `${supabaseConfigError}. Falling back to Local Preview Dataset.`;
    console.error('Supabase config load failed', {
      url: runtimeDataSourceConfig.SUPABASE_URL,
      error: error.message,
    });
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
    const rows = [];

    for (let offset = 0; ; offset += supabaseFetchPageSize) {
      const response = await fetch(requestUrl, {
        headers: supabaseRequestHeaders({
          Range: `${offset}-${offset + supabaseFetchPageSize - 1}`,
          'Range-Unit': 'items',
        }),
      });

      if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);

      const pageRows = await response.json();
      if (!Array.isArray(pageRows)) throw new Error('Supabase products response was not an array');

      rows.push(...pageRows);
      if (pageRows.length < supabaseFetchPageSize) break;
    }

    supabaseProducts = rows.map(normalizeSupabaseProduct);
    supabaseSourceStatus = 'ready';
    supabaseSourceError = '';
  } catch (error) {
    supabaseProducts = [];
    supabaseSourceStatus = 'error';
    supabaseSourceError = `Supabase Product Warehouse failed: ${error.message}. Falling back to Local Preview Dataset.`;
    console.error('Supabase fetch failed', {
      url: runtimeDataSourceConfig.SUPABASE_URL,
      error: error.message,
    });
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



function supabaseRequestHeaders(extraHeaders = {}) {
  return {
    apikey: runtimeDataSourceConfig.SUPABASE_ANON_KEY,
    Authorization: `Bearer ${runtimeDataSourceConfig.SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
    ...extraHeaders,
  };
}


function createCsvImportState(overrides = {}) {
  return {
    status: 'idle',
    fileName: '',
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    validProducts: [],
    invalidExamples: [],
    inserted: 0,
    skipped: 0,
    failed: 0,
    message: '',
    ...overrides,
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  row.push(field);
  rows.push(row);

  return rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ''));
}

function normalizeCsvPlatform(value) {
  const platform = String(value || '').trim().toLowerCase();
  if (platform.includes('tiktok')) return 'TikTok';
  if (platform.includes('shopee')) return 'Shopee';
  if (platform.includes('lazada')) return 'Lazada';
  return String(value || '').trim();
}

function splitCsvTargets(value) {
  return String(value || '')
    .split(/[;|]/)
    .map((target) => target.trim())
    .filter(Boolean);
}

function createCsvValidationError(fileName, message) {
  return createCsvImportState({
    status: 'error',
    fileName,
    message,
  });
}

function validateCsvProductRows(csvText, fileName = '') {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return createCsvValidationError(fileName, 'CSV file is empty.');

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const missingColumns = csvImportColumns.filter((column) => !headers.includes(column));
  if (missingColumns.length > 0) {
    return createCsvValidationError(fileName, `Missing required columns: ${missingColumns.join(', ')}.`);
  }

  const columnIndexes = Object.fromEntries(csvImportColumns.map((column) => [column, headers.indexOf(column)]));
  const validProducts = [];
  const invalidExamples = [];
  const dataRows = rows.slice(1).filter((row) => row.some((value) => value.trim() !== ''));

  dataRows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2;
    const getValue = (column) => String(row[columnIndexes[column]] || '').trim();
    const platform = normalizeCsvPlatform(getValue('platform'));
    const title = getValue('title');
    const productUrl = getValue('product_url');
    const errors = [];

    if (!platform) errors.push('platform is required');
    if (!title) errors.push('title is required');
    if (!productUrl) errors.push('product_url is required');
    if (productUrl && !getUrlObject(productUrl)) errors.push('product_url must be a valid URL');

    if (errors.length > 0) {
      invalidExamples.push({ rowNumber, errors });
      return;
    }

    validProducts.push({
      platform,
      title,
      image_url: getValue('image_url'),
      price: getValue('price'),
      commission: getValue('commission'),
      total_sales: getValue('sales'),
      target_tags: splitCsvTargets(getValue('target')),
      source_url: productUrl,
      data_source: 'csv_upload',
      fetched_at: new Date().toISOString(),
    });
  });

  return createCsvImportState({
    status: 'preview',
    fileName,
    totalRows: dataRows.length,
    validRows: validProducts.length,
    invalidRows: invalidExamples.length,
    validProducts,
    invalidExamples: invalidExamples.slice(0, 10),
    message: validProducts.length > 0
      ? 'Review the first 10 valid rows before importing into Supabase.'
      : 'No valid rows are available to import.',
  });
}

function supabaseProductsEndpoint(query = '') {
  const baseUrl = runtimeDataSourceConfig.SUPABASE_URL.replace(/\/$/, '');
  return `${baseUrl}/rest/v1/products${query}`;
}

function encodePostgrestInValues(values) {
  return encodeURIComponent(`in.(${values.map((value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')})`);
}

async function fetchExistingSupabaseProductUrls(productUrls) {
  const existingUrls = new Set();

  for (let index = 0; index < productUrls.length; index += supabaseImportChunkSize) {
    const batch = productUrls.slice(index, index + supabaseImportChunkSize);
    if (batch.length === 0) continue;

    const response = await fetch(supabaseProductsEndpoint(`?select=source_url&source_url=${encodePostgrestInValues(batch)}`), {
      headers: supabaseRequestHeaders(),
    });

    if (!response.ok) throw new Error(`Duplicate check failed with Supabase HTTP ${response.status}`);

    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Duplicate check response was not an array');
    rows.forEach((row) => {
      if (row.source_url) existingUrls.add(row.source_url);
    });
  }

  return existingUrls;
}

async function insertSupabaseProducts(products) {
  let inserted = 0;
  let failed = 0;

  for (let index = 0; index < products.length; index += supabaseImportChunkSize) {
    const batch = products.slice(index, index + supabaseImportChunkSize);
    if (batch.length === 0) continue;

    const response = await fetch(supabaseProductsEndpoint(), {
      method: 'POST',
      headers: supabaseRequestHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      }),
      body: JSON.stringify(batch),
    });

    if (response.ok) {
      inserted += batch.length;
    } else {
      failed += batch.length;
    }
  }

  return { inserted, failed };
}

async function handleCsvFileSelected(file) {
  csvImportState = createCsvImportState({
    status: 'parsing',
    fileName: file.name,
    message: 'Parsing CSV file…',
  });
  render();

  try {
    csvImportState = validateCsvProductRows(await file.text(), file.name);
  } catch (error) {
    csvImportState = createCsvValidationError(file.name, error.message);
  }

  render();
}

async function importPreviewRowsToSupabase() {
  if (csvImportState.validRows === 0 || csvImportState.status === 'importing') return;

  csvImportState = createCsvImportState({
    ...csvImportState,
    status: 'importing',
    inserted: 0,
    skipped: 0,
    failed: 0,
    message: 'Checking Supabase for duplicate product_url values…',
  });
  render();

  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase Product Warehouse is not configured. Enable USE_SUPABASE and provide the public anon key before importing CSV rows.');
    }

    const seenUrls = new Set();
    const uniqueValidProducts = csvImportState.validProducts.filter((product) => {
      if (seenUrls.has(product.source_url)) return false;
      seenUrls.add(product.source_url);
      return true;
    });
    const duplicateRowsInCsv = csvImportState.validProducts.length - uniqueValidProducts.length;
    const existingUrls = await fetchExistingSupabaseProductUrls(uniqueValidProducts.map((product) => product.source_url));
    const productsToInsert = uniqueValidProducts.filter((product) => !existingUrls.has(product.source_url));
    const skipped = duplicateRowsInCsv + existingUrls.size;

    csvImportState = createCsvImportState({
      ...csvImportState,
      status: 'importing',
      skipped,
      message: `Importing ${productsToInsert.length} valid product(s) into Supabase…`,
    });
    render();

    const result = await insertSupabaseProducts(productsToInsert);
    csvImportState = createCsvImportState({
      ...csvImportState,
      status: result.failed > 0 ? 'error' : 'complete',
      inserted: result.inserted,
      skipped,
      failed: result.failed,
      message: result.failed > 0
        ? 'Some rows failed to import. Check Supabase table permissions and required columns.'
        : 'Import complete. Discovery Results refreshed from Supabase.',
    });

    discoveryDataSource = 'supabase';
    await fetchProductsFromSupabase();
  } catch (error) {
    csvImportState = createCsvImportState({
      ...csvImportState,
      status: 'error',
      failed: csvImportState.validRows,
      message: error.message,
    });
    render();
  }
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
  const selectionKey = product?.id ?? product?.sourceUrl ?? product?.productUrl ?? product?.title ?? '';
  return String(selectionKey);
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


const imagePromptCategories = [
  { category: 'Hero Product Shot', visualStyle: 'clean studio lighting with premium e-commerce composition' },
  { category: 'Lifestyle Scene', visualStyle: 'natural real-life environment with aspirational product use' },
  { category: 'Premium Advertising Visual', visualStyle: 'luxury campaign lighting with polished brand layout' },
  { category: 'Close-up Detail', visualStyle: 'macro detail focus with crisp texture and feature emphasis' },
  { category: 'UGC Creator Style', visualStyle: 'authentic creator handheld framing with casual social proof' },
  { category: 'Social Media Square Post', visualStyle: 'bold square social layout with readable product-first framing' },
  { category: 'Feature Highlight', visualStyle: 'annotated feature callouts with clear benefit-focused composition' },
  { category: 'Before/After or Comparison', visualStyle: 'split-screen comparison with strong visual contrast' },
  { category: 'Promotional Banner', visualStyle: 'wide promotional graphic with offer-ready negative space' },
  { category: 'Conversion Ad', visualStyle: 'direct-response ad visual with persuasive product placement' },
];

function createImageWorkspaceState(overrides = {}) {
  return {
    prompts: [],
    jobs: [],
    images: [],
    notice: '',
    ...overrides,
  };
}

function readImageWorkspaceState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(imageWorkspaceStorageKey) || '{}');
    return createImageWorkspaceState({
      prompts: Array.isArray(savedState.prompts) ? savedState.prompts : [],
      jobs: Array.isArray(savedState.jobs) ? savedState.jobs : [],
      images: Array.isArray(savedState.images) ? savedState.images : [],
      notice: savedState.notice || '',
    });
  } catch {
    return createImageWorkspaceState();
  }
}

function saveImageWorkspaceState() {
  localStorage.setItem(imageWorkspaceStorageKey, JSON.stringify(imageWorkspaceState));
}

function promptProductKey(product) {
  return productSelectionKey(normalizeProduct(product));
}

function getProductTarget(product) {
  const normalizedProduct = normalizeProduct(product);
  const tags = Array.isArray(normalizedProduct.targetTags) ? normalizedProduct.targetTags : [];
  return tags.length > 0 ? tags.join(', ') : 'Content-ready product buyer';
}

function createImagePrompt(product, categoryConfig, index) {
  const normalizedProduct = normalizeProduct(product);
  const productKey = promptProductKey(normalizedProduct);
  const target = getProductTarget(normalizedProduct);
  const categoryNumber = index + 1;
  const promptText = `${categoryConfig.category} for ${normalizedProduct.title} on ${normalizedProduct.platform}. Show price ${normalizedProduct.price}, speak to ${target}, and use ${categoryConfig.visualStyle}.`;

  return {
    id: `${productKey}-prompt-${categoryNumber}`,
    productId: productKey,
    productTitle: normalizedProduct.title,
    platform: normalizedProduct.platform,
    target,
    price: normalizedProduct.price,
    category: categoryConfig.category,
    visualStyle: categoryConfig.visualStyle,
    promptText,
    selected: false,
  };
}

function generateImagePromptsForProduct(product) {
  const normalizedProduct = normalizeProduct(product);
  const productKey = promptProductKey(normalizedProduct);
  const existingPrompts = imageWorkspaceState.prompts.filter((prompt) => prompt.productId === productKey);

  if (existingPrompts.length > 0) {
    imageWorkspaceState = createImageWorkspaceState({
      ...imageWorkspaceState,
      notice: `Prompts already exist for ${normalizedProduct.title}. Select prompts below or clear the workspace before regenerating.`,
    });
    saveImageWorkspaceState();
    if (typeof window !== 'undefined') window.location.hash = 'generated-image-prompts';
    render();
    return;
  }

  const generatedPrompts = imagePromptCategories.map((categoryConfig, index) => createImagePrompt(normalizedProduct, categoryConfig, index));
  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    prompts: [...imageWorkspaceState.prompts, ...generatedPrompts],
    notice: `Generated ${generatedPrompts.length} image prompts for ${normalizedProduct.title}. Mark prompts as selected, then use them for image jobs.`,
  });
  saveImageWorkspaceState();
  render();
}

function toggleImagePrompt(promptId) {
  const nextPrompts = imageWorkspaceState.prompts.map((prompt) => (
    prompt.id === promptId ? { ...prompt, selected: !prompt.selected } : prompt
  ));
  const selectedCount = nextPrompts.filter((prompt) => prompt.selected).length;

  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    prompts: nextPrompts,
    notice: selectedCount > 0
      ? `${selectedCount} prompt(s) selected. Click Use Selected Prompts for Images to create pending jobs.`
      : 'No prompts selected yet.',
  });
  saveImageWorkspaceState();
  render();
}

function createImageJobFromPrompt(prompt) {
  return {
    jobId: `${prompt.id}-image-job`,
    promptId: prompt.id,
    productId: prompt.productId,
    productTitle: prompt.productTitle,
    category: prompt.category,
    prompt: prompt.promptText,
    status: 'pending',
  };
}

function createImageJobsFromSelectedPrompts() {
  const selectedPrompts = imageWorkspaceState.prompts.filter((prompt) => prompt.selected);
  const existingJobIds = new Set(imageWorkspaceState.jobs.map((job) => job.jobId));
  const newJobs = selectedPrompts
    .map(createImageJobFromPrompt)
    .filter((job) => !existingJobIds.has(job.jobId));

  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: [...imageWorkspaceState.jobs, ...newJobs],
    notice: newJobs.length > 0
      ? `Created ${newJobs.length} pending image job(s). Run the Image Queue to simulate generation.`
      : 'Selected prompts already have image jobs in the queue.',
  });
  saveImageWorkspaceState();
  render();
}

function getImageJobCounters() {
  return imageWorkspaceState.jobs.reduce(
    (counters, job) => ({
      ...counters,
      [job.status]: (counters[job.status] || 0) + 1,
      total: counters.total + 1,
    }),
    { pending: 0, selected: 0, generating: 0, completed: 0, failed: 0, total: 0 },
  );
}

function selectAllImageJobs() {
  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: imageWorkspaceState.jobs.map((job) => (
      job.status === 'pending' ? { ...job, status: 'selected' } : job
    )),
    notice: 'All pending image jobs are selected and ready to run.',
  });
  saveImageWorkspaceState();
  render();
}

function removeImageJob(jobId) {
  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: imageWorkspaceState.jobs.filter((job) => job.jobId !== jobId),
    images: imageWorkspaceState.images.filter((image) => image.jobId !== jobId),
    notice: 'Image job removed from the queue.',
  });
  saveImageWorkspaceState();
  render();
}

function removeCompletedImageJobs() {
  const completedJobIds = new Set(imageWorkspaceState.jobs.filter((job) => job.status === 'completed').map((job) => job.jobId));
  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: imageWorkspaceState.jobs.filter((job) => job.status !== 'completed'),
    images: imageWorkspaceState.images.filter((image) => !completedJobIds.has(image.jobId)),
    notice: 'Completed image jobs removed from the queue.',
  });
  saveImageWorkspaceState();
  render();
}

function clearImageJobsQueue() {
  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: [],
    images: [],
    notice: 'Image Jobs Queue cleared.',
  });
  saveImageWorkspaceState();
  render();
}

function createGalleryImageFromJob(job) {
  return {
    id: `${job.jobId}-placeholder-image`,
    jobId: job.jobId,
    promptId: job.promptId,
    productId: job.productId,
    productTitle: job.productTitle,
    category: job.category,
    promptPreview: job.prompt,
    selected: job.status === 'completed',
  };
}

function runImageQueue() {
  const runnableJobIds = imageWorkspaceState.jobs
    .filter((job) => job.status === 'pending' || job.status === 'selected')
    .map((job) => job.jobId);

  if (runnableJobIds.length === 0) return;

  imageWorkspaceState = createImageWorkspaceState({
    ...imageWorkspaceState,
    jobs: imageWorkspaceState.jobs.map((job) => (
      runnableJobIds.includes(job.jobId) ? { ...job, status: 'generating' } : job
    )),
    notice: `Running ${runnableJobIds.length} image job(s).`,
  });
  saveImageWorkspaceState();
  render();

  setTimeout(() => {
    const completedJobs = imageWorkspaceState.jobs
      .filter((job) => runnableJobIds.includes(job.jobId))
      .map((job) => ({ ...job, status: 'completed' }));
    const completedJobIds = new Set(completedJobs.map((job) => job.jobId));
    const otherImages = imageWorkspaceState.images.filter((image) => !completedJobIds.has(image.jobId));

    imageWorkspaceState = createImageWorkspaceState({
      ...imageWorkspaceState,
      jobs: imageWorkspaceState.jobs.map((job) => (
        completedJobIds.has(job.jobId) ? { ...job, status: 'completed' } : job
      )),
      images: [...otherImages, ...completedJobs.map(createGalleryImageFromJob)],
      notice: `Completed ${completedJobs.length} image job(s) and added placeholder gallery images.`,
    });
    saveImageWorkspaceState();
    render();
  }, 350);
}

function readProductsFromStorage(storage) {
  try {
    const savedProducts = JSON.parse(storage.getItem(productStorageKey) || '[]');
    return Array.isArray(savedProducts) ? dedupeProducts(savedProducts) : [];
  } catch {
    return [];
  }
}

function readSelectedProducts() {
  return readProductsFromStorage(localStorage);
}

function readContentGeneratorProducts() {
  const sessionProducts = readProductsFromStorage(sessionStorage);
  return sessionProducts.length > 0 ? sessionProducts : readSelectedProducts();
}

function saveSelectedProducts() {
  selectedProducts = dedupeProducts(selectedProducts);
  localStorage.setItem(productStorageKey, JSON.stringify(selectedProducts.slice(0, maxSelectedProducts)));
}

function saveSelectedProductsForContentGenerator() {
  saveSelectedProducts();
  sessionStorage.setItem(productStorageKey, JSON.stringify(selectedProducts.slice(0, maxSelectedProducts)));
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

  const id = rawProduct.id ?? (sourceUrl || `${platform}-${title}`);

  return {
    id: String(id),
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
  selectedProducts = selectedProducts.filter((product) => productSelectionKey(product) !== String(productId));
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
  const normalizedProduct = normalizeProduct(product);
  const productId = productSelectionKey(normalizedProduct);

  return `
    <button class="product-card ${isSelected(normalizedProduct) ? 'selected' : ''}" data-discovery-product="${escapeHtml(productId)}" data-discovery-product-id="${escapeHtml(productId)}" type="button">
      <img alt="" src="${escapeHtml(normalizedProduct.image)}" />
      <div class="product-info">
        <span class="platform-chip">${escapeHtml(normalizedProduct.platform)}</span>
        <h3>${escapeHtml(normalizedProduct.title)}</h3>
        <div class="product-metrics">
          <span>${escapeHtml(normalizedProduct.price)}</span>
          <span>${escapeHtml(normalizedProduct.commission)} commission</span>
          <span>${escapeHtml(normalizedProduct.totalSales)} sales</span>
        </div>
      </div>
    </button>
  `;
}

function renderImportedProductCard(product) {
  const normalizedProduct = normalizeProduct(product);
  const productId = productSelectionKey(normalizedProduct);

  return `
    <button class="product-card ${isSelected(normalizedProduct) ? 'selected' : ''} ${!normalizedProduct.supported ? 'disabled' : ''}" data-import-product-id="${escapeHtml(productId)}" type="button">
      <img alt="" src="${escapeHtml(normalizedProduct.image)}" />
      <div class="product-info">
        <span class="platform-chip">${escapeHtml(normalizedProduct.platform)}</span>
        <h3>${escapeHtml(normalizedProduct.title)}</h3>
        <div class="product-metrics">
          <span>${escapeHtml(normalizedProduct.price)}</span>
          <span class="source-url">${escapeHtml(normalizedProduct.sourceUrl)}</span>
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



function isSupabasePrimaryActive() {
  return discoveryDataSource === 'supabase' && supabaseSourceStatus === 'ready';
}

function getDiscoverySourceLabel() {
  if (isSupabasePrimaryActive()) return 'Supabase Product Warehouse';
  if (discoveryDataSource === 'external' && externalSourceStatus === 'ready') return 'External JSON Database';
  return 'Local Preview Dataset';
}

function renderCsvImportSummary() {
  const previewRows = csvImportState.validProducts.slice(0, 10)
    .map(
      (product) => `
        <tr>
          <td>${escapeHtml(product.platform)}</td>
          <td>${escapeHtml(product.title)}</td>
          <td>${escapeHtml(product.price || '—')}</td>
          <td>${escapeHtml(product.source_url)}</td>
        </tr>
      `,
    )
    .join('');
  const invalidRows = csvImportState.invalidExamples
    .map((example) => `<li>Row ${example.rowNumber}: ${escapeHtml(example.errors.join('; '))}</li>`)
    .join('');
  const summaryVisible = csvImportState.status !== 'idle';

  if (!summaryVisible) {
    return '<p class="csv-help-text">CSV columns: platform, target, title, price, commission, sales, image_url, product_url.</p>';
  }

  return `
    <div class="csv-import-summary ${escapeHtml(csvImportState.status)}">
      <p><strong>${escapeHtml(csvImportState.fileName || 'CSV file')}</strong> — ${escapeHtml(csvImportState.message)}</p>
      <div class="csv-import-stats" aria-label="CSV import counts">
        <span>Total rows: <strong>${csvImportState.totalRows}</strong></span>
        <span>Valid rows: <strong>${csvImportState.validRows}</strong></span>
        <span>Invalid rows: <strong>${csvImportState.invalidRows}</strong></span>
        <span>Inserted: <strong>${csvImportState.inserted}</strong></span>
        <span>Skipped duplicates: <strong>${csvImportState.skipped}</strong></span>
        <span>Failed: <strong>${csvImportState.failed}</strong></span>
      </div>
      ${previewRows ? `
        <div class="csv-preview-table-wrap">
          <table class="csv-preview-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Title</th>
                <th>Price</th>
                <th>Product URL</th>
              </tr>
            </thead>
            <tbody>${previewRows}</tbody>
          </table>
        </div>
      ` : ''}
      ${invalidRows ? `<ul class="csv-import-errors">${invalidRows}</ul>` : ''}
    </div>
  `;
}

function renderDataSourceStatusPanel() {
  if (activeTab !== 'auto') return '';

  const supabaseConnected = isSupabasePrimaryActive();
  const supabaseStatus = supabaseConnected ? 'Connected' : 'Not Connected / Fallback Active';
  const productsLoaded = supabaseConnected ? supabaseProducts.length : 0;
  const fallbackRow = !supabaseConnected && (supabaseSourceStatus === 'error' || discoveryDataSource === 'supabase')
    ? '<article><h3>Local Preview Dataset</h3><p>Fallback Active</p></article>'
    : '';
  const errorMessage = [supabaseSourceError, externalSourceError]
    .filter(Boolean)
    .map((message) => `<p class="source-error">${escapeHtml(message)}</p>`)
    .join('');
  const loadingMessage = supabaseSourceStatus === 'loading'
    ? '<p class="source-loading">Loading Supabase Product Warehouse…</p>'
    : '';
  const importBusy = csvImportState.status === 'parsing' || csvImportState.status === 'importing';
  const canImportPreview = isSupabaseConfigured() && csvImportState.validRows > 0 && !importBusy;
  const diagnosticError = supabaseConfigError || supabaseSourceError || 'None';
  const diagnosticLine = `Config loaded: ${supabaseConfigLoaded ? 'Yes' : 'No'} · Supabase URL host: ${getSupabaseUrlHost()} · Error: ${diagnosticError}`;

  return `
    <section class="data-source-panel compact-data-sources" aria-label="Data Sources">
      <div class="compact-source-header">
        <p class="eyebrow">DATA SOURCES</p>
        <div class="source-header-actions">
          <span>${productsLoaded} products loaded</span>
          <button class="csv-action-button" ${importBusy ? 'disabled' : ''} id="import-csv-button" type="button">Import CSV</button>
          <input accept=".csv,text/csv" class="visually-hidden" id="csv-product-file" type="file" />
        </div>
      </div>
      <p class="source-label">${escapeHtml(diagnosticLine)}</p>
      ${loadingMessage}
      ${errorMessage}
      <div class="compact-source-grid">
        <article>
          <h3>Supabase Product Warehouse</h3>
          <p>${supabaseStatus}</p>
        </article>
        <article>
          <h3>Products Loaded</h3>
          <p>${productsLoaded}</p>
        </article>
        <article>
          <h3>Shopee Affiliate API</h3>
          <p>Not Connected</p>
        </article>
        <article>
          <h3>TikTok Shop Provider</h3>
          <p>Not Connected</p>
        </article>
        <article>
          <h3>Lazada Affiliate API</h3>
          <p>Not Connected</p>
        </article>
        <article>
          <h3>Kalodata API</h3>
          <p>Not Connected</p>
        </article>
        ${fallbackRow}
      </div>
      <div class="csv-import-workflow">
        <div class="csv-import-heading">
          <div>
            <h3>CSV Import Preview</h3>
            <p>Upload and review valid rows before importing into Supabase.</p>
          </div>
          <button class="csv-action-button secondary" ${canImportPreview ? '' : 'disabled'} id="import-valid-csv-rows" type="button">Import Valid Rows</button>
        </div>
        ${renderCsvImportSummary()}
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
          <button aria-label="Remove ${escapeHtml(product.title)}" data-remove-product-id="${escapeHtml(productSelectionKey(product))}" type="button">
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
          ${renderDataSourceStatusPanel()}
          ${renderDiscoveryResults()}
        </div>
        ${renderSelectedProducts()}
      </section>
    </main>
  `;
}

function renderContentProductCard(product) {
  return `
    <article class="content-product-card">
      <img alt="" src="${escapeHtml(product.image)}" />
      <div>
        <span class="platform-chip">${escapeHtml(product.platform)}</span>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.price)}</p>
        <a class="source-url" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noreferrer">product_url: ${escapeHtml(product.sourceUrl)}</a>
        <button class="workspace-action-button" data-generate-prompts-product-id="${escapeHtml(promptProductKey(product))}" type="button">Generate Image Prompts</button>
      </div>
    </article>
  `;
}

function renderGeneratedPromptCard(prompt) {
  return `
    <article class="prompt-card ${prompt.selected ? 'selected' : ''}">
      <div class="prompt-card-header">
        <span class="platform-chip">${escapeHtml(prompt.category)}</span>
        <button class="prompt-toggle" data-toggle-prompt-id="${escapeHtml(prompt.id)}" type="button">
          ${prompt.selected ? 'Selected' : 'Mark as Selected'}
        </button>
      </div>
      <h3>${escapeHtml(prompt.productTitle)}</h3>
      <dl class="prompt-meta">
        <div><dt>Platform</dt><dd>${escapeHtml(prompt.platform)}</dd></div>
        <div><dt>Target</dt><dd>${escapeHtml(prompt.target)}</dd></div>
        <div><dt>Price</dt><dd>${escapeHtml(prompt.price)}</dd></div>
        <div><dt>Visual Style</dt><dd>${escapeHtml(prompt.visualStyle)}</dd></div>
      </dl>
      <p>${escapeHtml(prompt.promptText)}</p>
    </article>
  `;
}

function renderPlaceholderImageCard(image) {
  return `
    <article class="placeholder-image-card ${image.selected ? 'selected' : ''}">
      <div class="placeholder-image-art" aria-hidden="true">
        <span>${escapeHtml(image.category)}</span>
      </div>
      <div>
        <span class="platform-chip">${image.selected ? 'Selected Prompt' : 'Unselected Prompt'}</span>
        <h3>${escapeHtml(image.productTitle)}</h3>
        <p>${escapeHtml(image.category)}</p>
        <small>${escapeHtml(image.promptPreview)}</small>
      </div>
    </article>
  `;
}


function renderImageJobCard(job) {
  return `
    <article class="image-job-card">
      <div>
        <h3>${escapeHtml(job.productTitle)}</h3>
        <p>${escapeHtml(job.category)}</p>
      </div>
      <span class="job-status-badge ${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
      <button class="job-remove-button" data-remove-image-job-id="${escapeHtml(job.jobId)}" type="button">Remove Job</button>
    </article>
  `;
}

function renderImageCreationWorkspace(savedProducts) {
  const selectedPromptCount = imageWorkspaceState.prompts.filter((prompt) => prompt.selected).length;
  const promptCards = imageWorkspaceState.prompts.map(renderGeneratedPromptCard).join('');
  const imageCards = imageWorkspaceState.images.map(renderPlaceholderImageCard).join('');
  const jobCards = imageWorkspaceState.jobs.map(renderImageJobCard).join('');
  const jobCounters = getImageJobCounters();
  const hasRunnableJobs = imageWorkspaceState.jobs.some((job) => job.status === 'pending' || job.status === 'selected');
  const promptEmptyState = imageWorkspaceState.prompts.length === 0
    ? '<p class="empty-state">Generate image prompts from a selected product to start.</p>'
    : '';
  const jobEmptyState = imageWorkspaceState.jobs.length === 0
    ? '<p class="empty-state">Use selected prompts to create pending image jobs.</p>'
    : '';
  const galleryEmptyState = imageWorkspaceState.images.length === 0
    ? '<p class="empty-state">Run completed image jobs to create placeholder image cards.</p>'
    : '';
  const workspaceNotice = imageWorkspaceState.notice
    ? `<p class="workspace-notice">${escapeHtml(imageWorkspaceState.notice)}</p>`
    : '';

  return `
    <section class="image-workspace-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Image Creation</p>
          <h2>Image Creation</h2>
          <p class="source-label">Local prompt workspace only. No image API is connected yet.</p>
        </div>
        <span>${savedProducts.length} selected product(s)</span>
      </div>
      ${workspaceNotice}
      <div class="image-creation-product-list">
        ${savedProducts.length === 0 ? '<p class="empty-state">No selected products available for image prompts.</p>' : savedProducts.map((product) => `
          <article class="image-creation-product">
            <img alt="" src="${escapeHtml(product.image)}" />
            <div>
              <span class="platform-chip">${escapeHtml(product.platform)}</span>
              <h3>${escapeHtml(product.title)}</h3>
              <p>${escapeHtml(product.price)}</p>
            </div>
            <button class="workspace-action-button" data-generate-prompts-product-id="${escapeHtml(promptProductKey(product))}" type="button">Generate Image Prompts</button>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="image-workspace-section" id="generated-image-prompts">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Generated Image Prompts</p>
          <h2>Generated Image Prompts</h2>
          <p class="source-label">${selectedPromptCount} prompt(s) marked as selected.</p>
        </div>
        <button class="workspace-action-button secondary" ${selectedPromptCount === 0 ? 'disabled' : ''} id="use-selected-prompts" type="button">Use Selected Prompts for Images</button>
      </div>
      <div class="prompt-grid">${promptEmptyState}${promptCards}</div>
    </section>

    <section class="image-workspace-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Image Jobs Queue</p>
          <h2>Image Jobs Queue</h2>
          <p class="source-label">Pending prompts are queued here before simulated image generation.</p>
        </div>
        <div class="queue-actions">
          <button class="workspace-action-button" ${imageWorkspaceState.jobs.length === 0 ? 'disabled' : ''} id="select-all-image-jobs" type="button">Select All</button>
          <button class="workspace-action-button secondary" ${hasRunnableJobs ? '' : 'disabled'} id="run-image-queue" type="button">Run Image Queue</button>
          <button class="workspace-action-button" ${jobCounters.completed === 0 ? 'disabled' : ''} id="remove-completed-image-jobs" type="button">Remove Completed</button>
          <button class="workspace-action-button danger" ${imageWorkspaceState.jobs.length === 0 ? 'disabled' : ''} id="clear-image-jobs" type="button">Clear Queue</button>
        </div>
      </div>
      <div class="job-summary-grid">
        <span>Pending <strong>${jobCounters.pending}</strong></span>
        <span>Completed <strong>${jobCounters.completed}</strong></span>
        <span>Failed <strong>${jobCounters.failed}</strong></span>
        <span>Total <strong>${jobCounters.total}</strong></span>
      </div>
      <div class="image-jobs-list">${jobEmptyState}${jobCards}</div>
    </section>

    <section class="image-workspace-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Generated Images Gallery</p>
          <h2>Generated Images Gallery</h2>
          <p class="source-label">Placeholder cards only. Real image generation is not connected.</p>
        </div>
        <span>${imageWorkspaceState.images.length} placeholder image(s)</span>
      </div>
      <div class="placeholder-gallery">${galleryEmptyState}${imageCards}</div>
    </section>
  `;
}

function renderContentGeneratorLanding() {
  imageWorkspaceState = readImageWorkspaceState();
  const savedProducts = readContentGeneratorProducts().map((product) => normalizeProduct(product));
  const productCards = savedProducts.map(renderContentProductCard).join('');
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
          <h2>Selected Products</h2>
          <span>${savedProducts.length}/${maxSelectedProducts}</span>
        </div>
        <div class="content-products-grid">${emptyState}${productCards}</div>
      </section>
      ${renderImageCreationWorkspace(savedProducts)}
      <a class="back-link back-button" href="/novaforge-studio-new/">Back to Product Command Center</a>
    </main>
  `;
}


function attachContentGeneratorEvents() {
  const savedProducts = readContentGeneratorProducts().map((product) => normalizeProduct(product));

  document.querySelectorAll('[data-generate-prompts-product-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const product = savedProducts.find((item) => promptProductKey(item) === String(button.dataset.generatePromptsProductId));
      if (product) generateImagePromptsForProduct(product);
    });
  });

  document.querySelectorAll('[data-toggle-prompt-id]').forEach((button) => {
    button.addEventListener('click', () => toggleImagePrompt(button.dataset.togglePromptId));
  });

  document.querySelector('#use-selected-prompts')?.addEventListener('click', () => {
    createImageJobsFromSelectedPrompts();
  });

  document.querySelector('#select-all-image-jobs')?.addEventListener('click', selectAllImageJobs);
  document.querySelector('#run-image-queue')?.addEventListener('click', runImageQueue);
  document.querySelector('#remove-completed-image-jobs')?.addEventListener('click', removeCompletedImageJobs);
  document.querySelector('#clear-image-jobs')?.addEventListener('click', clearImageJobsQueue);

  document.querySelectorAll('[data-remove-image-job-id]').forEach((button) => {
    button.addEventListener('click', () => removeImageJob(button.dataset.removeImageJobId));
  });
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


  document.querySelector('#import-csv-button')?.addEventListener('click', () => {
    document.querySelector('#csv-product-file')?.click();
  });

  document.querySelector('#csv-product-file')?.addEventListener('change', (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) return;
    handleCsvFileSelected(file);
    event.target.value = '';
  });

  document.querySelector('#import-valid-csv-rows')?.addEventListener('click', () => {
    importPreviewRowsToSupabase();
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
      const productId = card.dataset.discoveryProductId || card.dataset.discoveryProduct;
      const product = getDiscoveryResults().find((item) => productSelectionKey(item) === String(productId));
      if (product) toggleProduct(product);
    });
  });

  document.querySelectorAll('[data-import-product-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const product = getImportedProducts().find((item) => productSelectionKey(item) === String(card.dataset.importProductId));
      if (product) toggleProduct(product);
    });
  });

  document.querySelectorAll('[data-remove-product-id]').forEach((removeButton) => {
    removeButton.addEventListener('click', () => removeSelectedProduct(removeButton.dataset.removeProductId));
  });

  document.querySelector('#continue-to-content')?.addEventListener('click', () => {
    if (selectedProducts.length === 0) return;

    saveSelectedProductsForContentGenerator();
    window.location.href = '/novaforge-studio-new/content-generator/';
  });
}

function render() {
  const root = document.querySelector('#root');

  if (window.location.pathname.replace(/\/$/, '').endsWith('/content-generator')) {
    root.innerHTML = renderContentGeneratorLanding();
    attachContentGeneratorEvents();
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

if (window.location.pathname.replace(/\/$/, '').endsWith('/content-generator')) {
  render();
} else {
  loadDataSourceConfig();
}

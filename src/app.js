const maxSelectedProducts = 10;
const productStorageKey = 'selectedProducts';
const imageWorkspaceStorageKey = 'contentGeneratorImageWorkspace';
const platformOptions = ['All Platforms', 'TikTok', 'Shopee', 'Lazada'];
const targetOptions = ['All', 'High Commission', 'High Profit', 'Best Seller', 'Trending', 'New Arrival'];
const csvImportColumns = ['platform', 'target', 'title', 'price', 'commission', 'sales', 'image_url', 'product_url'];
const supabaseImportChunkSize = 100;
const supabaseFetchPageSize = 1000;
const importLinks = Array.from({ length: maxSelectedProducts }, () => '');

const aiEngineIntegrations = [
  { name: 'Google Flow API', status: 'Placeholder only', notes: 'Backend endpoint required before requests can be sent.' },
  { name: 'Grok API', status: 'Placeholder only', notes: 'Store API credentials in backend services only.' },
  { name: 'Nano Banana', status: 'Placeholder only', notes: 'Provider connector not implemented in frontend.' },
  { name: 'ChatGPT / OpenAI', status: 'Placeholder only', notes: 'Use backend or Supabase Edge Functions for secrets.' },
  { name: 'Gemini', status: 'Placeholder only', notes: 'Backend endpoint required for real generation.' },
];

const platformAccountGroups = [
  {
    platform: 'TikTok',
    maxAccounts: 4,
    accounts: [
      { accountName: 'TikTok Creator Account 1', status: 'Not connected', permissions: 'Drafts, media upload, publish approval', autoPostAllowed: false },
      { accountName: 'TikTok Creator Account 2', status: 'Not connected', permissions: 'Drafts only', autoPostAllowed: false },
      { accountName: 'TikTok Creator Account 3', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
      { accountName: 'TikTok Creator Account 4', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
    ],
  },
  {
    platform: 'Shopee',
    maxAccounts: 4,
    accounts: [
      { accountName: 'Shopee Store Account 1', status: 'Not connected', permissions: 'Affiliate content drafts', autoPostAllowed: false },
      { accountName: 'Shopee Store Account 2', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
      { accountName: 'Shopee Store Account 3', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
      { accountName: 'Shopee Store Account 4', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
    ],
  },
  {
    platform: 'Lazada',
    maxAccounts: 4,
    accounts: [
      { accountName: 'Lazada Store Account 1', status: 'Not connected', permissions: 'Affiliate content drafts', autoPostAllowed: false },
      { accountName: 'Lazada Store Account 2', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
      { accountName: 'Lazada Store Account 3', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
      { accountName: 'Lazada Store Account 4', status: 'Not connected', permissions: 'Awaiting OAuth', autoPostAllowed: false },
    ],
  },
];

const postingRules = [
  { label: 'Auto Post', value: 'Off' },
  { label: 'Require Approval Before Post', value: 'On' },
  { label: 'Save Draft Only', value: 'On' },
  { label: 'Random Hashtags', value: 'Off' },
];

const platformCaptionRules = [
  { platform: 'TikTok', rule: 'Short hook first, product benefit second, hashtags last.' },
  { platform: 'Shopee', rule: 'Mention product use case, price/value cue, and store-safe CTA.' },
  { platform: 'Lazada', rule: 'Use concise promo framing with product title and benefit-focused CTA.' },
];

const hashtagGeneratorSettings = [
  { label: 'Random hashtags', value: 'Off' },
  { label: 'Niche hashtags', value: 'On' },
  { label: 'Product hashtags', value: 'On' },
  { label: 'Platform hashtags', value: 'On' },
  { label: 'Max hashtag count', value: '12' },
];


const creativeProjectGoals = [
  'Sell Product',
  'Create Podcast',
  'Create Commercial',
  'Create Documentary',
  'Create MV',
  'Create Educational Content',
  'Custom Project',
];

const creativeReferenceTypes = [
  'Product Reference',
  'Character Reference',
  'Style Reference',
  'Brand Reference',
  'Location Reference',
];

const creativeStudioConcepts = [
  {
    title: 'Luxury Documentary',
    description: 'A cinematic product story that makes the offer feel premium, intentional, and emotionally grounded.',
    confidence: '94%',
  },
  {
    title: 'ASMR Product Film',
    description: 'A sensory-first sequence built around texture, sound cues, close-up detail, and slow product reveals.',
    confidence: '89%',
  },
  {
    title: 'Editorial Fashion Campaign',
    description: 'A high-style visual direction with curated poses, refined locations, and brand-forward composition.',
    confidence: '86%',
  },
];

const creativeBlueprintItems = [
  { label: 'Goal', value: 'Sell Product with premium narrative tension' },
  { label: 'Audience', value: 'Style-aware buyers comparing quality and value' },
  { label: 'Style', value: 'Soft luxury, editorial documentary, restrained motion' },
  { label: 'Emotion', value: 'Trust, desire, calm confidence' },
  { label: 'Character', value: 'Creator-led product expert with natural presence' },
  { label: 'Audio Direction', value: 'Warm ASMR textures, subtle room tone, elegant pacing' },
];

const creativeStoryboardScenes = [
  {
    scene: 'Scene 1',
    duration: '0:00–0:04',
    camera: 'Slow macro push-in',
    motion: 'Product reveal through soft foreground blur',
    audio: 'Low room tone + tactile product sound',
    description: 'Introduce the product as a premium object before showing any selling points.',
  },
  {
    scene: 'Scene 2',
    duration: '0:04–0:10',
    camera: 'Handheld creator close-up',
    motion: 'Small natural hand movement',
    audio: 'Whispered hook with clean foley accents',
    description: 'Creator frames the emotional reason the product matters in everyday life.',
  },
  {
    scene: 'Scene 3',
    duration: '0:10–0:18',
    camera: 'Detail inserts + overhead composition',
    motion: 'Rhythmic cuts between feature details',
    audio: 'Soft clicks, fabric, packaging, or usage sounds',
    description: 'Show three visual proof points with no crowded text or hard-sell energy.',
  },
  {
    scene: 'Scene 4',
    duration: '0:18–0:24',
    camera: 'Locked hero frame',
    motion: 'Subtle light sweep and final product settle',
    audio: 'Elegant resolve with short CTA breath',
    description: 'End with a calm conversion moment that feels curated rather than forced.',
  },
];

const directorPanelSections = [
  {
    title: 'Recommended Direction',
    body: 'Lead with a premium product truth, then let sensory details prove value before the call-to-action.',
  },
  {
    title: 'Alternative Concepts',
    body: 'Try creator documentary, silent luxury unboxing, or fast social comparison if the audience needs proof quickly.',
  },
  {
    title: 'Creative Suggestions',
    body: 'Use fewer captions, tighter close-ups, warm shadows, and one memorable audio texture tied to product handling.',
  },
  {
    title: 'Trend Insights',
    body: 'Soft-sell creator films and sensory product demos are strong fits for premium commerce without feeling like ads.',
  },
];

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
let creativeSearchQuery = '';
let expandedKeywords = [];
let selectedCreativeTags = [];
let creativeSearchNotice = '';
let projectGoal = 'Sell Product';
let selectedConceptId = '';
let generatedStoryboardScenes = [];
let storyboardVariation = 0;
let storyboardNotice = '';

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


function renderAiEngineCard(engine) {
  return `
    <article class="integration-card">
      <div>
        <span class="platform-chip">AI Engine</span>
        <h3>${escapeHtml(engine.name)}</h3>
        <p>${escapeHtml(engine.notes)}</p>
      </div>
      <strong>${escapeHtml(engine.status)}</strong>
    </article>
  `;
}

function renderPlatformAccountCard(account, platform) {
  return `
    <article class="integration-card account-card">
      <div>
        <span class="platform-chip">${escapeHtml(platform)}</span>
        <h3>${escapeHtml(account.accountName)}</h3>
        <p>Permissions: ${escapeHtml(account.permissions)}</p>
      </div>
      <dl class="settings-meta">
        <div><dt>Connection Status</dt><dd>${escapeHtml(account.status)}</dd></div>
        <div><dt>Auto Post Allowed</dt><dd>${account.autoPostAllowed ? 'true' : 'false'}</dd></div>
      </dl>
    </article>
  `;
}

function renderSettingsPill(item) {
  return `
    <article class="settings-pill">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </article>
  `;
}

function renderSettingsIntegrationsPage() {
  const aiEngineCards = aiEngineIntegrations.map(renderAiEngineCard).join('');
  const accountGroups = platformAccountGroups
    .map((group) => `
      <section class="settings-subsection">
        <div class="section-heading compact-heading">
          <h3>${escapeHtml(group.platform)} accounts</h3>
          <span>Max ${group.maxAccounts}</span>
        </div>
        <div class="settings-grid">${group.accounts.map((account) => renderPlatformAccountCard(account, group.platform)).join('')}</div>
      </section>
    `)
    .join('');
  const postingRuleCards = postingRules.map(renderSettingsPill).join('');
  const captionRuleCards = platformCaptionRules
    .map((rule) => `
      <article class="settings-rule-card">
        <span class="platform-chip">${escapeHtml(rule.platform)}</span>
        <p>${escapeHtml(rule.rule)}</p>
      </article>
    `)
    .join('');
  const hashtagCards = hashtagGeneratorSettings.map(renderSettingsPill).join('');

  return `
    <main class="page-shell settings-page">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Settings / Integrations</p>
          <h1>⚙️ Settings / Integrations</h1>
          <p class="description">Backend-ready integration settings for AI engines, platform accounts, posting rules, and hashtag generation.</p>
        </div>
        <a class="back-link back-button" href="/novaforge-studio-new/">Back to Product Command Center</a>
      </section>

      <section class="settings-warning">
        <strong>Security warning:</strong>
        Real OAuth tokens, API keys, platform credentials, and posting secrets must be stored in backend services or Supabase Edge Functions. This page uses placeholders only and does not post content.
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">AI Engine</p>
            <h2>AI Engine Integrations</h2>
          </div>
          <span>Placeholders only</span>
        </div>
        <div class="settings-grid">${aiEngineCards}</div>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Platform Accounts</p>
            <h2>Platform Accounts</h2>
          </div>
          <span>4 accounts max per platform</span>
        </div>
        ${accountGroups}
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Posting Rules</p>
            <h2>Posting Rules</h2>
          </div>
          <span>Posting disabled</span>
        </div>
        <div class="settings-grid compact-settings-grid">${postingRuleCards}</div>
        <p class="source-label">Platform-specific caption rules are placeholders for backend posting workflows and do not publish content.</p>
        <div class="caption-rule-grid">${captionRuleCards}</div>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Hashtag Generator</p>
            <h2>Hashtag Generator Settings</h2>
          </div>
          <span>Local settings only</span>
        </div>
        <div class="settings-grid compact-settings-grid">${hashtagCards}</div>
      </section>
    </main>
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
        <a class="back-link back-button" href="/novaforge-studio-new/settings/">Settings / Integrations</a>
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



function uniqueCreativeTags(tags) {
  const seenTags = new Set();

  return tags.filter((tag) => {
    const normalizedTag = String(tag).trim();
    const tagKey = normalizedTag.toLowerCase();
    if (!normalizedTag || seenTags.has(tagKey)) return false;
    seenTags.add(tagKey);
    return true;
  });
}

function expandCreativeKeywords(query) {
  const normalizedQuery = String(query || '').toLowerCase();
  const matchedTags = [];

  if (normalizedQuery.includes('luxury')) {
    matchedTags.push('Luxury', 'Premium', 'Editorial', 'Luxury Lighting', 'Luxury Piano', 'High-End Product Film');
  }

  if (normalizedQuery.includes('asmr')) {
    matchedTags.push('ASMR', 'Silent Product Film', 'Soft Sound Design', 'Ambient', 'Texture Close-Up', 'Slow Motion');
  }

  if (normalizedQuery.includes('beach')) {
    matchedTags.push('Beach', 'Ocean', 'Island', 'Golden Hour', 'Ocean Waves', 'Resort', 'Relaxing');
  }

  if (normalizedQuery.includes('podcast')) {
    matchedTags.push('Podcast', 'Interview', 'Storytelling', 'Voice Direction', 'Long Form', 'Conversation');
  }

  if (normalizedQuery.includes('fashion')) {
    matchedTags.push('Fashion Campaign', 'Editorial Fashion', 'Runway', 'Model Movement', 'Studio Lighting');
  }

  if (normalizedQuery.includes('product')) {
    matchedTags.push('Product Showcase', 'Hero Shot', 'Feature Highlight', 'Conversion Ad', 'Product Focus');
  }

  if (normalizedQuery.includes('viral')) {
    matchedTags.push('Viral Hook', 'Fast Cut', 'Trend Format', 'Bold Text', 'High Energy');
  }

  return uniqueCreativeTags(matchedTags.length > 0
    ? matchedTags
    : ['Creative Direction', 'Storytelling', 'Cinematic', 'Product Focus', 'Social Content']);
}

function expandCreativeSearchIdeas() {
  expandedKeywords = expandCreativeKeywords(creativeSearchQuery);
  selectedCreativeTags = selectedCreativeTags.filter((selectedTag) => expandedKeywords.includes(selectedTag));
  selectedConceptId = '';
  generatedStoryboardScenes = [];
  storyboardVariation = 0;
  storyboardNotice = '';
  creativeSearchNotice = creativeSearchQuery.trim()
    ? `Expanded ${expandedKeywords.length} creative direction tag(s) from your search.`
    : 'No search text yet, so NOVAFORGE suggested a balanced creative starter set.';
  render();
}

function toggleCreativeTag(tag) {
  if (selectedCreativeTags.includes(tag)) {
    selectedCreativeTags = selectedCreativeTags.filter((selectedTag) => selectedTag !== tag);
  } else {
    selectedCreativeTags = [...selectedCreativeTags, tag];
  }

  selectedConceptId = '';
  generatedStoryboardScenes = [];
  storyboardVariation = 0;
  storyboardNotice = '';
  creativeSearchNotice = selectedCreativeTags.length > 0
    ? `${selectedCreativeTags.length} creative tag(s) selected for AI Director guidance.`
    : 'All creative tags deselected. Select tags to shape the mock direction.';
  render();
}

function renderCreativeTagChip(tag, selected = false, removable = false) {
  return `
    <button
      class="creative-tag-chip ${selected ? 'selected' : ''} ${removable ? 'removable' : ''}"
      data-creative-tag="${escapeHtml(tag)}"
      type="button"
    >
      <span>${escapeHtml(tag)}</span>${removable ? '<span aria-hidden="true">×</span>' : ''}
    </button>
  `;
}

function getSelectedTagsSummary() {
  return selectedCreativeTags.length > 0 ? selectedCreativeTags.join(', ') : expandedKeywords.slice(0, 3).join(', ') || 'cinematic product direction';
}

function getCreativeDirectorSections(activeConcept) {
  if (activeConcept) {
    const tagSummary = getSelectedTagsSummary();
    const storyboardStructure = getStoryboardStructureTitle(activeConcept);
    const storyboardReady = generatedStoryboardScenes.length > 0;

    return [
      {
        title: 'Recommended Direction',
        body: storyboardReady
          ? `${activeConcept.title} uses a ${storyboardStructure} narrative structure because it matches the selected goal, tags, and product context.`
          : `Selected concept: ${activeConcept.title}. Recommended next step: generate storyboard direction and confirm the first scene hook.`,
      },
      {
        title: 'Alternative Concepts',
        body: `If ${activeConcept.title} feels too narrow, compare it against ${tagSummary} and generate a second local mock direction before writing prompts.`,
      },
      {
        title: 'Creative Suggestions',
        body: `Use ${activeConcept.style}, ${activeConcept.audioDirection}, and ${activeConcept.cameraDirection} as the creative guardrails for this canvas.`,
      },
      {
        title: 'Trend Insights',
        body: `Mock insight: ${activeConcept.contentFormat} concepts land better when the story angle is visible before the product proof sequence.`,
      },
    ];
  }

  if (expandedKeywords.length === 0) return directorPanelSections;

  const tagSummary = getSelectedTagsSummary();
  const expandedSummary = expandedKeywords.slice(0, 5).join(', ');

  return [
    {
      title: 'Recommended Direction',
      body: `Based on your search, NOVAFORGE suggests a cinematic concept using ${tagSummary}.`,
    },
    {
      title: 'Alternative Concepts',
      body: `Explore variations around ${expandedSummary}, then narrow the canvas by selecting only the tags that support the strongest creative goal.`,
    },
    {
      title: 'Creative Suggestions',
      body: `Let ${tagSummary} guide visual pacing, camera rhythm, audio texture, and how product proof appears before any prompt is written.`,
    },
    {
      title: 'Trend Insights',
      body: `Mock insight: ${expandedKeywords[0]} concepts perform best when the first scene establishes mood before showing product details.`,
    },
  ];
}

function createMockConcepts({ selectedProducts: products = [], selectedCreativeTags: tags = [], creativeSearchQuery: query = '', projectGoal: goal = 'Sell Product' } = {}) {
  const normalizedProducts = products.map((product) => normalizeProduct(product));
  const selectedProduct = normalizedProducts[0];
  const productTitle = selectedProduct?.title || 'selected product';
  const searchContext = query.trim() || tags.join(', ') || 'creative direction';
  const candidateConcepts = [];
  const hasTag = (tagName) => tags.some((tag) => tag.toLowerCase().includes(tagName.toLowerCase()));
  const addConcept = (concept) => {
    if (!candidateConcepts.some((existingConcept) => existingConcept.id === concept.id)) candidateConcepts.push(concept);
  };

  if (hasTag('ASMR')) {
    addConcept({
      id: 'asmr-product-film',
      title: 'ASMR Product Film',
      description: `A sensory-first film for ${productTitle}, using tactile detail and soft sound to make the product feel close and desirable.`,
      confidenceScore: '92%',
      style: 'Sensory close-up minimalism',
      emotion: 'Calm curiosity',
      contentFormat: 'Short product film',
      audioDirection: 'Soft sound design, texture foley, low ambient bed',
      cameraDirection: 'Macro close-ups, slow push-ins, controlled hand movement',
      storyAngle: `Turn ${productTitle} into a quiet sensory ritual connected to ${searchContext}.`,
    });
  }

  if (hasTag('Luxury') || hasTag('Premium')) {
    addConcept({
      id: 'luxury-documentary',
      title: 'Luxury Documentary',
      description: `A premium documentary-style concept that frames ${productTitle} as refined, intentional, and emotionally valuable.`,
      confidenceScore: '94%',
      style: 'Premium editorial documentary',
      emotion: 'Trust, desire, quiet confidence',
      contentFormat: 'Cinematic product story',
      audioDirection: 'Warm piano, soft room tone, restrained transitions',
      cameraDirection: 'Slow hero frames, detail inserts, elegant locked shots',
      storyAngle: `Show why ${productTitle} deserves attention before asking for action.`,
    });
  }

  if (hasTag('Podcast')) {
    addConcept({
      id: 'podcast-story-concept',
      title: 'Podcast Story Concept',
      description: `A voice-led concept that turns ${productTitle} into a discussion topic with narrative hooks and conversation pacing.`,
      confidenceScore: '91%',
      style: 'Editorial audio-led storytelling',
      emotion: 'Credible, thoughtful, conversational',
      contentFormat: 'Podcast segment / interview opener',
      audioDirection: 'Clean voice direction, subtle intro bed, intimate pacing',
      cameraDirection: 'Static medium framing with cutaway product detail shots',
      storyAngle: `Introduce ${productTitle} through a human problem, then let conversation reveal the value.`,
    });
  }

  if (hasTag('Viral')) {
    addConcept({
      id: 'viral-short-form-hook',
      title: 'Viral Short-Form Hook',
      description: `A fast hook-driven concept that makes ${productTitle} instantly understandable and shareable in the first seconds.`,
      confidenceScore: '88%',
      style: 'Fast social-first energy',
      emotion: 'Surprise, momentum, urgency',
      contentFormat: 'Short-form social video',
      audioDirection: 'High-energy beat, quick cuts, hook emphasis',
      cameraDirection: 'Fast punch-ins, snap transitions, creator POV shots',
      storyAngle: `Open with the strongest reason ${productTitle} matters, then prove it visually.`,
    });
  }

  [
    {
      id: 'cinematic-product-story',
      title: 'Cinematic Product Story',
      description: `A polished story arc for ${productTitle} that turns product proof into an emotional creative journey.`,
      confidenceScore: '87%',
      style: 'Cinematic lifestyle storytelling',
      emotion: 'Trust and aspiration',
      contentFormat: 'Brand product film',
      audioDirection: 'Soft cinematic bed with natural product moments',
      cameraDirection: 'Wide establishing shot, medium creator moment, close-up proof',
      storyAngle: `Connect ${productTitle} to the audience goal: ${goal}.`,
    },
    {
      id: 'premium-social-campaign',
      title: 'Premium Social Campaign',
      description: `A social-first campaign that keeps ${productTitle} premium without making the layout feel like a corporate ad.`,
      confidenceScore: '84%',
      style: 'Premium social editorial',
      emotion: 'Desire and confidence',
      contentFormat: 'Social campaign sequence',
      audioDirection: 'Modern ambient pulse with clean CTA spacing',
      cameraDirection: 'Hero shot, feature highlight, creator proof, final CTA',
      storyAngle: `Use ${searchContext} to make the product feel culturally relevant.`,
    },
    {
      id: 'educational-product-breakdown',
      title: 'Educational Product Breakdown',
      description: `A clear educational concept that explains ${productTitle} through benefits, use cases, and simple visual proof.`,
      confidenceScore: '82%',
      style: 'Clean instructional editorial',
      emotion: 'Clarity and trust',
      contentFormat: 'Educational product explainer',
      audioDirection: 'Calm voiceover, light UI cues, simple sound accents',
      cameraDirection: 'Overhead demonstration, feature close-ups, comparison frames',
      storyAngle: `Teach the viewer why ${productTitle} fits their goal before selling.`,
    },
  ].forEach(addConcept);

  return candidateConcepts.slice(0, 3);
}

function getCreativeStudioConcepts(savedProducts = []) {
  return createMockConcepts({
    selectedProducts: savedProducts,
    selectedCreativeTags,
    creativeSearchQuery,
    projectGoal,
  });
}

function getActiveConcept(savedProducts = []) {
  const concepts = getCreativeStudioConcepts(savedProducts);
  return concepts.find((concept) => concept.id === selectedConceptId) || concepts[0];
}

function selectCreativeConcept(conceptId) {
  selectedConceptId = conceptId;
  generatedStoryboardScenes = [];
  storyboardVariation = 0;
  storyboardNotice = 'Concept selected. Generate a storyboard to simulate the AI Director workflow.';
  creativeSearchNotice = 'Concept selected. Creative Blueprint and AI Director guidance updated.';
  render();
}


function getStoryboardStructureTitle(concept) {
  if (!concept) return 'goal → proof → direction → next step';
  if (concept.id === 'luxury-documentary') return 'reveal → story → experience → hero shot';
  if (concept.id === 'asmr-product-film') return 'texture → interaction → slow detail → ambient ending';
  if (concept.id === 'podcast-story-concept') return 'introduction → story build-up → key insight → closing thought';
  if (concept.id === 'viral-short-form-hook') return 'hook → problem → solution → CTA';
  return 'setup → proof → transformation → closing frame';
}

function getStoryboardSceneTemplates(concept) {
  if (concept?.id === 'luxury-documentary') {
    return [
      { title: 'Product Reveal', objective: 'Make the product feel premium before explaining it.' },
      { title: 'Brand Story', objective: 'Connect the product to a refined human motivation.' },
      { title: 'Product Experience', objective: 'Show tactile proof and emotional use context.' },
      { title: 'Closing Hero Shot', objective: 'End with a confident, memorable product image.' },
    ];
  }

  if (concept?.id === 'asmr-product-film') {
    return [
      { title: 'Texture Close-Up', objective: 'Open with sensory curiosity and product texture.' },
      { title: 'Product Interaction', objective: 'Let hands, sound, and pace show how the product feels.' },
      { title: 'Slow Motion Detail', objective: 'Highlight one feature through slow tactile detail.' },
      { title: 'Ambient Ending', objective: 'Leave the viewer with calm desire and product memory.' },
    ];
  }

  if (concept?.id === 'podcast-story-concept') {
    return [
      { title: 'Introduction', objective: 'Frame the topic and why the product belongs in the story.' },
      { title: 'Story Build-Up', objective: 'Build context through a human problem or conversation.' },
      { title: 'Key Insight', objective: 'Reveal the product benefit as the narrative insight.' },
      { title: 'Closing Thought', objective: 'End with a memorable takeaway and soft next step.' },
    ];
  }

  if (concept?.id === 'viral-short-form-hook') {
    return [
      { title: 'Hook', objective: 'Stop the scroll with one clear product tension.' },
      { title: 'Problem', objective: 'Show the pain point quickly and visually.' },
      { title: 'Solution', objective: 'Prove the product solves the problem in one beat.' },
      { title: 'CTA', objective: 'Close with a fast action cue and product hero.' },
    ];
  }

  return [
    { title: 'Opening Mood', objective: 'Establish the product world and emotional direction.' },
    { title: 'Need or Tension', objective: 'Show the viewer why the product matters.' },
    { title: 'Proof Moment', objective: 'Make the product value visible without over-explaining.' },
    { title: 'Closing Frame', objective: 'Resolve the story with a clear visual memory.' },
  ];
}

function getStoryboardVariationDetails(index, variation) {
  const cameraSets = [
    ['Slow macro push-in', 'Elegant medium tracking shot', 'Detail insert sequence', 'Locked hero frame'],
    ['Soft overhead drift', 'Handheld creator close-up', 'Side-lit detail move', 'Low angle final hero'],
  ];
  const motionSets = [
    ['Gentle reveal', 'Measured story movement', 'Rhythmic detail pacing', 'Subtle product settle'],
    ['Floating transition', 'Natural hand movement', 'Slow motion accent', 'Soft light sweep'],
  ];
  const audioSets = [
    ['Low room tone', 'Warm narrative bed', 'Tactile product foley', 'Elegant resolve'],
    ['Soft ambient pad', 'Close voice texture', 'Detailed sound accents', 'Minimal closing note'],
  ];
  const durationSets = [
    ['0:00–0:04', '0:04–0:10', '0:10–0:18', '0:18–0:24'],
    ['0:00–0:03', '0:03–0:09', '0:09–0:16', '0:16–0:22'],
  ];
  const variationIndex = variation % 2;

  return {
    duration: durationSets[variationIndex][index],
    camera: cameraSets[variationIndex][index],
    motion: motionSets[variationIndex][index],
    audio: audioSets[variationIndex][index],
  };
}

function generateMockStoryboard({ selectedConcept, selectedCreativeTags: tags = [], selectedProducts: products = [], projectGoal: goal = 'Sell Product', variation = 0 } = {}) {
  const normalizedProducts = products.map((product) => normalizeProduct(product));
  const productTitle = normalizedProducts[0]?.title || 'selected product';
  const concept = selectedConcept || createMockConcepts({ selectedProducts: normalizedProducts, selectedCreativeTags: tags, creativeSearchQuery, projectGoal: goal })[0];
  const tagContext = tags.length > 0 ? tags.join(', ') : 'cinematic product direction';

  return getStoryboardSceneTemplates(concept).map((scene, index) => {
    const variationDetails = getStoryboardVariationDetails(index, variation);

    return {
      id: `${concept.id}-scene-${index + 1}-v${variation + 1}`,
      title: scene.title,
      description: `${scene.title} for ${productTitle}, shaped by ${concept.title} and ${tagContext}.`,
      duration: variationDetails.duration,
      camera: variationDetails.camera,
      motion: variationDetails.motion,
      audio: variationDetails.audio,
      objective: scene.objective,
    };
  });
}

function getStoryboardEstimatedDuration(scenes = generatedStoryboardScenes) {
  return scenes.length > 0 ? scenes[scenes.length - 1].duration.split('–').pop() : 'Not generated yet';
}

function createStoryboardFromCurrentConcept(regenerate = false) {
  const savedProducts = readContentGeneratorProducts().map((product) => normalizeProduct(product));
  const activeConcept = getActiveConcept(savedProducts);
  if (!activeConcept) return;

  if (regenerate) storyboardVariation += 1;

  generatedStoryboardScenes = generateMockStoryboard({
    selectedConcept: activeConcept,
    selectedCreativeTags,
    selectedProducts: savedProducts,
    projectGoal,
    variation: storyboardVariation,
  });
  storyboardNotice = `${regenerate ? 'Regenerated' : 'Generated'} ${generatedStoryboardScenes.length} storyboard scene(s) for ${activeConcept.title}.`;
  render();
}


function renderProjectGoalSelector() {
  return `
    <label class="studio-field">
      <span>Project Goal</span>
      <select aria-label="Project Goal Selector" id="project-goal-selector">
        ${creativeProjectGoals.map((goal) => `<option value="${escapeHtml(goal)}" ${goal === projectGoal ? 'selected' : ''}>${escapeHtml(goal)}</option>`).join('')}
      </select>
    </label>
  `;
}

function renderCreativeSearchBar() {
  const keywordChips = expandedKeywords.length > 0
    ? expandedKeywords.map((tag) => renderCreativeTagChip(tag, selectedCreativeTags.includes(tag))).join('')
    : '<p class="creative-search-hint">Expand ideas to reveal hidden creative library tags.</p>';
  const selectedChips = selectedCreativeTags.length > 0
    ? `<div class="selected-creative-tags" aria-label="Selected Creative Tags">
        <span>Selected Creative Tags</span>
        <div class="creative-tag-list selected-tags-list">
          ${selectedCreativeTags.map((tag) => renderCreativeTagChip(tag, true, true)).join('')}
        </div>
      </div>`
    : '';
  const notice = creativeSearchNotice ? `<p class="creative-search-notice">${escapeHtml(creativeSearchNotice)}</p>` : '';

  return `
    <section class="creative-search-module" aria-label="Creative Search and Keyword Expansion">
      <label class="studio-field creative-search-field">
        <span>Creative Search</span>
        <input id="creative-search-input" type="search" placeholder="Describe the creative direction, e.g. Luxury ASMR Vanilla Campaign" value="${escapeHtml(creativeSearchQuery)}" />
      </label>
      <button class="creative-expand-button" id="expand-creative-ideas" type="button">Expand Ideas</button>
      ${notice}
      <div class="creative-tag-list" aria-label="Expanded Keyword Tags">
        ${keywordChips}
      </div>
      ${selectedChips}
    </section>
  `;
}

function renderReferenceDropzonePlaceholder(referenceType) {
  return `
    <article class="reference-placeholder">
      <span>${escapeHtml(referenceType)}</span>
      <p>Reference placeholder</p>
    </article>
  `;
}

function renderSelectedProductContext(product) {
  const normalizedProduct = normalizeProduct(product);

  return `
    <article class="studio-product-context-card">
      <img alt="" src="${escapeHtml(normalizedProduct.image)}" />
      <div>
        <span>${escapeHtml(normalizedProduct.platform)}</span>
        <strong>${escapeHtml(normalizedProduct.title)}</strong>
      </div>
    </article>
  `;
}

function renderConceptCard(concept) {
  const conceptSelected = selectedConceptId === concept.id;

  return `
    <article class="concept-card ${conceptSelected ? 'selected' : ''}">
      <div>
        <span class="studio-kicker">Concept</span>
        <h3>${escapeHtml(concept.title)}</h3>
        <p>${escapeHtml(concept.description)}</p>
      </div>
      <dl class="concept-meta">
        <div><dt>Style</dt><dd>${escapeHtml(concept.style)}</dd></div>
        <div><dt>Format</dt><dd>${escapeHtml(concept.contentFormat)}</dd></div>
      </dl>
      <div class="concept-card-footer">
        <span>Confidence score ${escapeHtml(concept.confidenceScore)}</span>
        <button data-select-concept-id="${escapeHtml(concept.id)}" type="button">${conceptSelected ? 'Selected' : 'Select'}</button>
      </div>
    </article>
  `;
}

function renderBlueprintPanel(savedProducts = []) {
  const selectedProduct = savedProducts[0] ? normalizeProduct(savedProducts[0]) : null;
  const activeConcept = getActiveConcept(savedProducts);
  const blueprintItems = [
    { label: 'Goal', value: projectGoal },
    { label: 'Selected Product', value: selectedProduct?.title || 'No selected product yet' },
    { label: 'Concept', value: activeConcept.title },
    { label: 'Audience', value: 'Creative buyers who need a clear reason to care before conversion.' },
    { label: 'Style', value: activeConcept.style },
    { label: 'Emotion', value: activeConcept.emotion },
    { label: 'Content Format', value: activeConcept.contentFormat },
    { label: 'Audio Direction', value: activeConcept.audioDirection },
    { label: 'Camera Direction', value: activeConcept.cameraDirection },
    { label: 'Story Angle', value: activeConcept.storyAngle },
    { label: 'Scenes', value: generatedStoryboardScenes.length > 0 ? String(generatedStoryboardScenes.length) : 'Not generated yet' },
    { label: 'Estimated Duration', value: getStoryboardEstimatedDuration() },
    { label: 'Primary Emotion', value: activeConcept.emotion },
    { label: 'Primary Style', value: activeConcept.style },
  ];

  return `
    <section class="studio-card blueprint-panel">
      <div class="studio-section-heading">
        <span class="studio-kicker">Creative Blueprint Placeholder</span>
        <h2>Creative Blueprint</h2>
        <p>Mock blueprint updates from the selected concept and current creative tags.</p>
      </div>
      <div class="blueprint-grid">
        ${blueprintItems.map((item) => `
          <article>
            <span>${escapeHtml(item.label)}</span>
            <p>${escapeHtml(item.value)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderStoryboardCard(scene, index = 0) {
  return `
    <article class="storyboard-card generated-storyboard-card">
      <div class="storyboard-card-header">
        <div>
          <span class="scene-number">Scene ${index + 1}</span>
          <h3>${escapeHtml(scene.title)}</h3>
        </div>
        <span>${escapeHtml(scene.duration)}</span>
      </div>
      <p>${escapeHtml(scene.description)}</p>
      <dl>
        <div><dt>Camera</dt><dd>${escapeHtml(scene.camera)}</dd></div>
        <div><dt>Motion</dt><dd>${escapeHtml(scene.motion)}</dd></div>
        <div><dt>Audio</dt><dd>${escapeHtml(scene.audio)}</dd></div>
        <div><dt>Objective</dt><dd>${escapeHtml(scene.objective)}</dd></div>
      </dl>
    </article>
  `;
}

function renderDirectorPanel(savedProducts = []) {
  const activeConcept = selectedConceptId ? getActiveConcept(savedProducts) : null;

  return `
    <aside class="studio-panel director-panel" aria-label="AI Director Panel">
      <div class="studio-panel-heading">
        <span class="studio-kicker">AI Director Panel</span>
        <h2>Director Notes</h2>
        <p>Mock guidance only. AI Director is not connected to generation APIs yet.</p>
      </div>
      <div class="ai-thinking-indicator" aria-label="AI thinking visual placeholder">
        <span class="ai-thinking-orb" aria-hidden="true"></span>
        <span>Living Creative Intelligence standby</span>
      </div>
      <div class="director-section-list">
        ${getCreativeDirectorSections(activeConcept).map((section) => `
          <section class="director-section">
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.body)}</p>
          </section>
        `).join('')}
      </div>
    </aside>
  `;
}

function renderCreativeInputsPanel(savedProducts) {
  const productContext = savedProducts.length > 0
    ? savedProducts.map(renderSelectedProductContext).join('')
    : '<p class="studio-empty-note">No selected products found. Return to Product Command Center to add product context.</p>';

  return `
    <aside class="studio-panel creative-inputs-panel" aria-label="Creative Inputs">
      <div class="studio-panel-heading">
        <span class="studio-kicker">Left Panel</span>
        <h2>Creative Inputs</h2>
        <p>Goal first. Search first. Library hidden.</p>
      </div>
      ${renderProjectGoalSelector()}
      ${renderCreativeSearchBar()}
      <section class="studio-input-section">
        <h3>References</h3>
        <div class="reference-placeholder-grid">
          ${creativeReferenceTypes.map(renderReferenceDropzonePlaceholder).join('')}
        </div>
      </section>
      <section class="studio-input-section">
        <h3>Selected Product Context</h3>
        <div class="studio-product-context-list">${productContext}</div>
      </section>
    </aside>
  `;
}

function renderCreativeCanvasPanel(savedProducts = []) {
  const concepts = getCreativeStudioConcepts(savedProducts);
  const storyboardCards = generatedStoryboardScenes.length > 0
    ? generatedStoryboardScenes.map(renderStoryboardCard).join('')
    : '<p class="empty-state storyboard-empty-state">Select a concept, then generate a storyboard to replace this placeholder.</p>';
  const storyboardActions = selectedConceptId
    ? `<div class="storyboard-actions">
        <button class="creative-expand-button" id="generate-storyboard" type="button">Generate Storyboard</button>
        <button class="creative-expand-button secondary" ${generatedStoryboardScenes.length === 0 ? 'disabled' : ''} id="regenerate-storyboard" type="button">Regenerate Storyboard</button>
      </div>`
    : '<p class="creative-search-hint">Select a concept to unlock storyboard generation.</p>';
  const notice = storyboardNotice ? `<p class="creative-search-notice">${escapeHtml(storyboardNotice)}</p>` : '';

  return `
    <section class="studio-canvas-panel" aria-label="Creative Canvas">
      <section class="studio-card concept-board">
        <div class="studio-section-heading">
          <span class="studio-kicker">Creative Canvas</span>
          <h2>Concept Board</h2>
          <p>Three possible directions before prompts are written.</p>
        </div>
        <div class="concept-card-grid">
          ${concepts.map(renderConceptCard).join('')}
        </div>
      </section>
      ${renderBlueprintPanel(savedProducts)}
      <section class="studio-card storyboard-panel">
        <div class="studio-section-heading storyboard-heading">
          <div>
            <span class="studio-kicker">Storyboard Generator Mock</span>
            <h2>Storyboard System</h2>
            <p>Mock scenes are generated from project goal, creative tags, selected concept, and selected products.</p>
          </div>
          ${storyboardActions}
        </div>
        ${notice}
        <div class="storyboard-grid">
          ${storyboardCards}
        </div>
      </section>
    </section>
  `;
}

function renderCreativeStudioShell(savedProducts) {
  return `
    <section class="creative-studio-shell" aria-label="NOVAFORGE Creative Studio V2">
      <div class="creative-studio-hero">
        <div>
          <span class="studio-kicker">NOVAFORGE Creative Studio V2</span>
          <h1>AI Creative Operating System</h1>
          <p>Goal First. Prompt Last. Search First. Library Hidden. Less Forms. More Canvas.</p>
        </div>
        <span class="studio-status-pill">${savedProducts.length} selected product(s) loaded</span>
      </div>
      <div class="creative-studio-grid">
        ${renderCreativeInputsPanel(savedProducts)}
        ${renderCreativeCanvasPanel(savedProducts)}
        ${renderDirectorPanel(savedProducts)}
      </div>
    </section>
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

  return `
    <main class="creative-studio-page">
      ${renderCreativeStudioShell(savedProducts)}
      <section class="legacy-image-workspace" aria-label="Legacy Image Workspace">
        <div class="legacy-workspace-heading">
          <span class="studio-kicker">Legacy Image Workspace</span>
          <h2>Legacy Image Workspace</h2>
          <p>Existing image prompts, image jobs queue, and placeholder gallery remain available below the Creative Studio V2 shell.</p>
        </div>
        ${renderImageCreationWorkspace(savedProducts)}
      </section>
      <a class="back-link back-button studio-back-link" href="/novaforge-studio-new/">Back to Product Command Center</a>
    </main>
  `;
}


function attachContentGeneratorEvents() {
  const savedProducts = readContentGeneratorProducts().map((product) => normalizeProduct(product));

  document.querySelector('#project-goal-selector')?.addEventListener('change', (event) => {
    projectGoal = event.target.value;
    selectedConceptId = '';
    generatedStoryboardScenes = [];
    storyboardNotice = '';
    creativeSearchNotice = 'Project goal updated. Concept Board and Creative Blueprint refreshed.';
    render();
  });

  document.querySelector('#creative-search-input')?.addEventListener('input', (event) => {
    creativeSearchQuery = event.target.value;
  });

  document.querySelector('#expand-creative-ideas')?.addEventListener('click', expandCreativeSearchIdeas);

  document.querySelectorAll('[data-select-concept-id]').forEach((conceptButton) => {
    conceptButton.addEventListener('click', () => selectCreativeConcept(conceptButton.dataset.selectConceptId));
  });

  document.querySelector('#generate-storyboard')?.addEventListener('click', () => createStoryboardFromCurrentConcept(false));
  document.querySelector('#regenerate-storyboard')?.addEventListener('click', () => createStoryboardFromCurrentConcept(true));

  document.querySelectorAll('[data-creative-tag]').forEach((tagButton) => {
    tagButton.addEventListener('click', () => toggleCreativeTag(tagButton.dataset.creativeTag));
  });

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

  if (window.location.pathname.replace(/\/$/, '').endsWith('/settings')) {
    root.innerHTML = renderSettingsIntegrationsPage();
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

if (window.location.pathname.replace(/\/$/, '').endsWith('/content-generator') || window.location.pathname.replace(/\/$/, '').endsWith('/settings')) {
  render();
} else {
  loadDataSourceConfig();
}

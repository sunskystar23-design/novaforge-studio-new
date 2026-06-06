const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('src/app.js', 'utf8').replace(/window\.addEventListener\('pageshow'[\s\S]*$/u, '');
const selectedProducts = [
  {
    id: 'verify-1',
    platform: 'TikTok',
    title: 'Verification Product',
    image: 'https://example.com/product.jpg',
    price: '฿999',
    sourceUrl: 'https://example.com/product',
  },
];
const storage = {
  selectedProducts: JSON.stringify(selectedProducts),
  contentGeneratorImageWorkspace: '{}',
};
const root = { innerHTML: '' };
const context = {
  console,
  URL,
  setTimeout,
  clearTimeout,
  localStorage: {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; },
  },
  sessionStorage: {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; },
  },
  document: {
    currentScript: { src: 'http://example.test/src/app.js' },
    querySelector: (selector) => (selector === '#root' ? root : null),
    querySelectorAll: () => [],
  },
  window: { location: { pathname: '/novaforge-studio-new/content-generator/', href: '' } },
};

vm.createContext(context);
vm.runInContext(code, context);
vm.runInContext(`
  selectedCreativeTags = ['Luxury'];
  selectedConceptId = 'luxury-documentary';
  favoriteConceptIds = ['luxury-documentary'];
  comparedConceptId = 'premium-social-campaign';
`, context);
let html = vm.runInContext('renderContentGeneratorLanding()', context);
[
  'Concept Decision Bar',
  'Favorite',
  'Compare',
  'Lock Direction',
  'Selected Direction',
  'Step Flow',
  'Next Step:',
  'Legacy Image Workspace',
  'Image Jobs Queue',
].forEach((text) => {
  if (!html.includes(text)) throw new Error(`Missing layout marker: ${text}`);
});
if (!html.includes('Storyboard based on: Luxury Documentary')) throw new Error('Storyboard selected concept reference missing');
vm.runInContext("toggleLockConcept('luxury-documentary')", context);
html = root.innerHTML;
if (!html.includes('Locked Direction')) throw new Error('Locked Direction badge missing');
if (!html.includes('Storyboard based on locked direction: Luxury Documentary')) throw new Error('Storyboard locked concept reference missing');
const pccHtml = vm.runInContext('renderProductCommandCenter()', context);
['Auto Discovery', 'Import Links', 'Data Sources', 'Selected Products Queue', 'Continue'].forEach((text) => {
  if (!pccHtml.includes(text)) throw new Error(`Product Command Center missing: ${text}`);
});
console.log('Layout verification passed');

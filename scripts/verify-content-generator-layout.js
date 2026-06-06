const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const app = fs.readFileSync('src/app.js', 'utf8');
const code = app.replace(/window\.addEventListener\('pageshow'[\s\S]*$/u, '');
const storage = {
  selectedProducts: JSON.stringify([
    {
      id: 'verify-1',
      platform: 'TikTok',
      title: 'Verification Product',
      image: 'https://example.com/product.jpg',
      price: '฿999',
      sourceUrl: 'https://example.com/product',
    },
  ]),
};

const context = {
  console,
  setTimeout,
  clearTimeout,
  btoa: (value) => Buffer.from(value, 'utf8').toString('base64'),
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
    querySelector() { return null; },
    querySelectorAll() { return []; },
  },
  window: { location: { pathname: '/novaforge-studio-new/content-generator/', href: '' } },
};

vm.createContext(context);
vm.runInContext(code, context);
const rendered = vm.runInContext('renderContentGenerator()', context);

assert.doesNotMatch(app, /Selected Products Loaded/);
assert.doesNotMatch(app, /AI Creative Operating System/);
assert.doesNotMatch(app, /NOVAFORGE CREATIVE STUDIO V2/);
assert.doesNotMatch(app, /SECTION 1/);
assert.doesNotMatch(app, /creative-workflow-nav/);
assert.doesNotMatch(app, /studio-nav/);
assert.doesNotMatch(rendered, /Selected Products Loaded/);
assert.doesNotMatch(rendered, /AI Creative Operating System/);
assert.doesNotMatch(rendered, /NOVAFORGE CREATIVE STUDIO V2/);
assert.doesNotMatch(rendered, /SECTION 1/);
assert.doesNotMatch(rendered, /creative-workflow-nav/);
assert.doesNotMatch(rendered, /studio-nav/);

assert.match(app, /function renderContentGenerator/);
assert.match(app, /renderProductContextBar\(savedProducts\)/);
assert.match(app, /renderCreativeStudioShell\(savedProducts\)/);
assert.match(app, /renderLegacyImageWorkspace\(savedProducts\)/);
assert.match(rendered, /product-context-bar/);
assert.match(rendered, /NOVAFORGE Creative Studio/);
assert.match(rendered, /creative-step-flow/);
assert.match(rendered, /concept-decision-bar/);
assert.match(rendered, /Legacy Image Workspace/);
assert.match(rendered, /Image Jobs Queue/);

console.log('Content Generator layout verification passed');

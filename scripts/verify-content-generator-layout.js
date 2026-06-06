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
assert.doesNotMatch(app, /isNewLayout/);
assert.doesNotMatch(app, /toggleLayout/);
assert.doesNotMatch(app, /Product Context Bar.*heading/);
assert.doesNotMatch(app, /product-card-grid.*renderProductContextBar/);
assert.doesNotMatch(rendered, /Selected Products Loaded/);
assert.doesNotMatch(rendered, /AI Creative Operating System/);
assert.doesNotMatch(rendered, /NOVAFORGE CREATIVE STUDIO V2/);
assert.doesNotMatch(rendered, /SECTION 1/);
assert.doesNotMatch(rendered, /creative-workflow-nav/);
assert.doesNotMatch(rendered, /studio-nav/);
assert.doesNotMatch(rendered, /Back to Product Command Center/);
assert.doesNotMatch(rendered, /href=\"\/novaforge-studio-new\/\"/);
assert.doesNotMatch(rendered, /<h1>Product Context Bar<\/h1>/);
assert.doesNotMatch(rendered, /loaded-products-grid/);

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notStrictEqual(start, -1, `${functionName} must exist`);
  const nextFunction = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, nextFunction === -1 ? source.length : nextFunction);
}

const productContextBody = extractFunctionBody(app, 'renderProductContextBar');
const contentGeneratorBody = extractFunctionBody(app, 'renderContentGenerator');
assert.doesNotMatch(productContextBody, /href=\"\/novaforge-studio-new\/\"/);
assert.doesNotMatch(contentGeneratorBody, /href=\"\/novaforge-studio-new\/\"/);
assert.match(app, /product-context-bar/);
assert.match(app, /pcb-primary/);
assert.match(app, /pcb-manage-btn/);
assert.match(app, /renderCreativeStepFlow.*renderCreativeCanvasPanel/);
assert.match(rendered, /Manage Products/);
assert.match(rendered, /class=\"pcb-manage-btn\"/);
assert.match(app, /Product selection is managed in Product Command Center\. Current mission keeps existing selection locked\./);
assert.match(app, /window\.location\.href = '\/novaforge-studio-new\/content-generator\/';/);
assert.match(vm.runInContext('renderProductCommandCenter()', context), /Product Command Center/);

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

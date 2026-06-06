const fs = require('fs');
const vm = require('vm');

const appSource = fs.readFileSync('src/app.js', 'utf8');
let code = appSource.replace(/window\.addEventListener\('pageshow'[\s\S]*$/u, '');
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
const stepButtons = [];
let scrollCount = 0;
let focusCount = 0;
const targetSelectors = [
  '#creative-inputs-panel',
  '#product-context-bar',
  '#character-engine-section',
  '#concept-board',
  '#storyboard-system',
  '#ai-director-panel',
  '#legacy-image-workspace',
];

function createStepButton(target) {
  return {
    dataset: { stepTarget: target },
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
  };
}

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
    querySelector(selector) {
      if (selector === '#root') return root;
      if (targetSelectors.includes(selector)) {
        return {
          scrollIntoView: () => { scrollCount += 1; },
          focus: () => { focusCount += 1; },
        };
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-step-target]') {
        stepButtons.length = 0;
        targetSelectors.forEach((target) => stepButtons.push(createStepButton(target)));
        return stepButtons;
      }
      return [];
    },
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
let html = vm.runInContext('renderContentGenerator()', context);
const forbiddenLegacyStrings = [
  'Selected Products ' + 'Loaded',
  'AI Creative ' + 'Operating System',
  'NOVAFORGE CREATIVE ' + 'STUDIO V2',
  'NOVAFORGE Creative ' + 'Studio V2',
];
forbiddenLegacyStrings.forEach((legacyString) => {
  if (html.includes(legacyString)) throw new Error(`Legacy Content Generator render string still visible: ${legacyString}`);
  if (appSource.includes(legacyString)) throw new Error(`Legacy Content Generator render string still exists in src/app.js: ${legacyString}`);
});
if (!/function renderContentGenerator\s*\(/.test(appSource)) throw new Error('function renderContentGenerator must exist');
if (!appSource.includes('renderProductContextBar(savedProducts)')) throw new Error('renderContentGenerator must call renderProductContextBar(savedProducts)');
if (!appSource.includes('renderCreativeStudioShell(savedProducts)')) throw new Error('renderContentGenerator must call renderCreativeStudioShell(savedProducts)');
if (!appSource.includes('renderLegacyImageWorkspace(savedProducts)')) throw new Error('renderContentGenerator must call renderLegacyImageWorkspace(savedProducts)');
if (/renderCreativeStudioShell[\s\S]*renderCreativeStepFlow[\s\S]*creative-studio-grid/.test(appSource)) throw new Error('renderCreativeStepFlow must not be called in renderCreativeStudioShell before creative-studio-grid');
if (!/renderCreativeCanvasPanel[\s\S]*renderCreativeStepFlow/.test(appSource)) throw new Error('renderCreativeStepFlow must be placed inside renderCreativeCanvasPanel');
['product-context-bar', 'pcb-left', 'pcb-manage-btn', 'NOVAFORGE Creative Studio', 'Goal first. Prompt last.'].forEach((text) => {
  if (!html.includes(text)) throw new Error(`Missing updated Content Generator marker: ${text}`);
});
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
['1 Goal', '2 Product', '3 Character', '4 Concept', '5 Storyboard', '6 Prompt Plan', '7 Generate'].forEach((label) => {
  if (!html.includes(`>${label}</button>`)) throw new Error(`Missing Step Flow button label: ${label}`);
});
if (!html.includes('Storyboard based on: Luxury Documentary')) throw new Error('Storyboard selected concept reference missing');
const buttonMatches = [...html.matchAll(/<button[^>]*data-step-target="([^"]+)"[^>]*type="button"/g)];
if (buttonMatches.length !== 7) throw new Error(`Expected 7 step flow buttons, found ${buttonMatches.length}`);
targetSelectors.forEach((target) => {
  if (!buttonMatches.some((match) => match[1] === target)) throw new Error(`Missing step flow target ${target}`);
});
if (/<a[^>]*data-step-target=/.test(html)) throw new Error('Step Flow must not render anchor navigation');
const stepFlowHandlerMatch = appSource.match(/document\.querySelectorAll\('\[data-step-target\]'\)[\s\S]*?document\.querySelectorAll\('\[data-director-action-id\]'\)/);
if (!stepFlowHandlerMatch) throw new Error('Step Flow handler block missing');
const stepFlowHandlerSource = stepFlowHandlerMatch[0];
['event.preventDefault()', 'event.stopPropagation()', 'document.querySelector(selector)', 'scrollIntoView'].forEach((snippet) => {
  if (!stepFlowHandlerSource.includes(snippet)) throw new Error(`Step Flow handler missing ${snippet}`);
});
['window.location.href', 'window.location.pathname', 'window.location.assign', 'window.location.replace', 'history.pushState', 'history.replaceState', '/novaforge-studio-new/', '/content-generator/'].forEach((forbidden) => {
  if (stepFlowHandlerSource.includes(forbidden)) throw new Error(`Step Flow handler uses forbidden routing: ${forbidden}`);
});
vm.runInContext("toggleLockConcept('luxury-documentary')", context);
html = root.innerHTML;
if (!html.includes('Locked Direction')) throw new Error('Locked Direction badge missing');
if (!html.includes('Storyboard based on locked direction: Luxury Documentary')) throw new Error('Storyboard locked concept reference missing');
const originalHref = context.window.location.href;
const originalPathname = context.window.location.pathname;
vm.runInContext('attachContentGeneratorEvents()', context);
if (stepButtons.length !== 7) throw new Error(`Expected 7 step click handlers, found ${stepButtons.length}`);
stepButtons.forEach((button) => {
  let prevented = false;
  let stopped = false;
  button.listeners.click({
    preventDefault: () => { prevented = true; },
    stopPropagation: () => { stopped = true; },
  });
  if (!prevented || !stopped) throw new Error(`Step ${button.dataset.stepTarget} did not prevent route bubbling`);
});
if (scrollCount !== 7) throw new Error(`Expected 7 local scroll calls, received ${scrollCount}`);
if (context.window.location.href !== originalHref || context.window.location.pathname !== originalPathname) {
  throw new Error('Step Flow click changed route');
}
const pccHtml = vm.runInContext('renderProductCommandCenter()', context);
['Auto Discovery', 'Import Links', 'Data Sources', 'Selected Products Queue', 'Continue'].forEach((text) => {
  if (!pccHtml.includes(text)) throw new Error(`Product Command Center missing: ${text}`);
});
console.log('Layout verification passed');

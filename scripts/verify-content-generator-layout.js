const fs = require('node:fs');
const assert = require('node:assert/strict');

const app = fs.readFileSync('src/app.js', 'utf8');
const styles = fs.readFileSync('src/styles.css', 'utf8');

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

assert.match(app, /function renderProductContextBar\(savedProducts = \[\]\)/, 'Product context bar renderer should exist.');
assert.match(app, /class="product-context-bar/, 'Product context bar markup should render.');
assert.match(styles, /\.product-context-bar\s*{/, 'Product context bar styles should exist.');
assert.doesNotMatch(app, /Selected Products Loaded/, 'Large Selected Products Loaded section should not render.');
assert.doesNotMatch(app, /selected-products-loaded-section/, 'Large selected products section class should not be referenced.');
assert.match(app, /<h1>NOVAFORGE Creative Studio<\/h1>/, 'Compact Creative Studio title should render.');
assert.match(app, /renderCreativeCanvasNextStepStrip/, 'Next Step strip should render in Creative Canvas.');
assert.match(app, /Start by describing the creative direction or expand ideas\./, 'Next Step strip should include the starting guidance.');
assert.match(app, /Selected Direction/, 'Concept selected badge text should exist.');
assert.match(app, /Storyboard will appear after concept selection\./, 'Storyboard compact empty state should render.');
assert.match(app, /storyboard-duration-pill/, 'Generated storyboard state should include a total duration indicator.');
assert.match(app, /data-director-action-group="\$\{escapeHtml\(group\.groupName\)\}"/, 'AI Director action groups should render.');
assert.match(app, /Strategy/, 'AI Director Strategy action group should exist.');
assert.match(app, /Visual Direction/, 'AI Director Visual Direction action group should exist.');
assert.match(app, /Production Prep/, 'AI Director Production Prep action group should exist.');
assert.doesNotMatch(app, /AI Creative Operating System/, 'Oversized old Creative Studio title should not render.');
assert.equal(countOccurrences(app, 'studio-status-pill'), 0, 'Selected product count should not be duplicated in old status pills.');
assert.equal(countOccurrences(app, 'product-context-count'), 2, 'Selected product count should be scoped to the product context bar states.');
assert.match(app, /Legacy Image Workspace/, 'Legacy Image Workspace should still render.');
assert.match(app, /Image Jobs Queue/, 'Image Jobs Queue should still exist.');
assert.match(app, /Product Command Center/, 'Product Command Center copy should remain in the application.');
assert.match(app, /<h1>🎯 Product Command Center<\/h1>/, 'Product Command Center heading should remain unchanged.');

console.log('Content Generator compact layout verification passed.');

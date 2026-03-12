const { adjustColorHover } = require('./colorUtils');
const assert = require('assert');

try {
    assert.strictEqual(adjustColorHover('#000000', 20), '#141414');
    assert.strictEqual(adjustColorHover('#ffffff', -20), '#ebebeb');
    assert.strictEqual(adjustColorHover('#000', 20), '#141414');
    assert.strictEqual(adjustColorHover('000000', 20), '#141414');
    assert.strictEqual(adjustColorHover('#ffffff', 20), '#ffffff');
    assert.strictEqual(adjustColorHover('#000000', -20), '#000000');
    assert.strictEqual(adjustColorHover('#0066cc', -20), '#0052b8');
    console.log('All tests passed!');
} catch (e) {
    console.error('Test failed!');
    console.error(e);
    process.exit(1);
}

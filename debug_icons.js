const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

console.log("Checking index.html for Phosphor script tags:");
document.querySelectorAll('script').forEach(s => {
    if (s.src) console.log(s.src);
});

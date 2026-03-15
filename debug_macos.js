const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

console.log("Number of .card elements:", document.querySelectorAll('.card').length);
document.querySelectorAll('.card').forEach(card => {
    const header = card.querySelector('.card-header');
    console.log(`Card ID: ${card.id}, has header: ${!!header}`);
    if (header) {
       console.log("  Header children count:", header.children.length);
    }
});

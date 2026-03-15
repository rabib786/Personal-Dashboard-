const fs = require('fs');

// Fix app.js duplicated listeners
let app = fs.readFileSync('app.js', 'utf8');

// We need to ensure we only attach mousedown listener once in initMacosWindows
const fixListeners = `
    const isMacOs = dashSettings.osThemeEnabled && dashSettings.osTheme === 'macos';
    if (!isMacOs) return;

    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        // Only initialize once to prevent duplicate listeners
        if (card.dataset.macosInitialized) return;
        card.dataset.macosInitialized = 'true';
`;

app = app.replace(/const isMacOs = dashSettings\.osThemeEnabled && dashSettings\.osTheme === 'macos';\s*if \(!isMacOs\) return;\s*const cards = document\.querySelectorAll\('\.card'\);\s*cards\.forEach\(\(card, index\) => \{/, fixListeners);

fs.writeFileSync('app.js', app);


// Fix CSS duplication
let css = fs.readFileSync('style.css', 'utf8');

// Find the first and second instance of .macos-context-menu
const firstIndex = css.indexOf('.macos-context-menu {');
const secondIndex = css.indexOf('.macos-context-menu {', firstIndex + 1);

if (secondIndex !== -1) {
    // We have a duplicate block, let's remove everything from the second block down to .card.mission-control-active
    // Actually the easiest way is to remove the specific duplicate block
    const duplicateBlock = `
.macos-context-menu {
    position: absolute;
    z-index: 100000;
    width: 240px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    padding: 6px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    display: none;
    flex-direction: column;
}

[data-theme="dark"] .macos-context-menu {
    background: rgba(40, 40, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.macos-context-item {
    padding: 4px 15px;
    cursor: default;
    color: #1d1d1f;
    user-select: none;
}

[data-theme="dark"] .macos-context-item {
    color: #fff;
}

.macos-context-item:hover {
    background: #0066cc;
    color: #fff;
}

.macos-context-separator {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 5px 0;
}

[data-theme="dark"] .macos-context-separator {
    background: rgba(255, 255, 255, 0.15);
}`;

    css = css.replace(duplicateBlock, ''); // Remove the first exact match, leaving the second one that contains the mission control styles
    fs.writeFileSync('style.css', css);
    console.log("Removed duplicate CSS block");
}

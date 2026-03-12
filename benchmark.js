const { JSDOM } = require("jsdom");
const { document } = (new JSDOM(`<!DOCTYPE html><div id="bank-apps-grid"></div>`)).window;

const bankAppsArr = Array.from({ length: 1000 }, (_, i) => ({
    path: `/path/${i}`,
    icon: `icon-${i}`,
    name: `App ${i}`
}));

function escapeHtml(str) { return str; }

function baseline() {
    const grid = document.getElementById('bank-apps-grid');
    grid.innerHTML = '';

    bankAppsArr.forEach((app, i) => {
        grid.innerHTML += `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${app.path}" target="_blank" class="app-tile">
                    <i class="ph-fill ${app.icon}"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button class="delete-btn bank-del-btn" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`;
    });
}

function optimized() {
    const grid = document.getElementById('bank-apps-grid');
    grid.innerHTML = '';

    let html = '';
    bankAppsArr.forEach((app, i) => {
        html += `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${app.path}" target="_blank" class="app-tile">
                    <i class="ph-fill ${app.icon}"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button class="delete-btn bank-del-btn" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`;
    });
    grid.innerHTML = html;
}

const startBaseline = performance.now();
baseline();
const endBaseline = performance.now();

const startOptimized = performance.now();
optimized();
const endOptimized = performance.now();

console.log(`Baseline: ${(endBaseline - startBaseline).toFixed(2)} ms`);
console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)} ms`);

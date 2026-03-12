// --- GLOBAL KEYBOARD SHORTCUTS ---
document.addEventListener('keydown', (e) => {
    // Alt + S = Search
    if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const sb = document.getElementById('universal-search');
        if(sb) sb.focus();
    }
    // Alt + T = Add Task
    if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        const ti = document.getElementById('todo-input');
        if(ti) ti.focus();
    }
    // Alt + N = New Note
    if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewNote();
    }
});

// --- UNIVERSAL SEARCH ---
function executeSearch(e) {
    if (e.key === 'Enter') {
        const query = document.getElementById('universal-search').value;
        const engine = document.getElementById('search-engine').value;
        if (!query.trim()) return;

        let url = '';
        if (engine === 'google') url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        else if (engine === 'duckduckgo') url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        else if (engine === 'bing') url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

        window.open(url, '_blank');
        document.getElementById('universal-search').value = '';
    }
}


// --- SETTINGS & THEME ENGINE ---
const defaultVis = { search: true, time: true, tasks: true, torn: true, bank: true, weather: true, calendar: true, shortcuts: true, notepad: true, news: true };
let rawSettings = JSON.parse(localStorage.getItem('dashSettings')) || {};

// Merged Settings state
let dashSettings = {
    name: rawSettings.name || '',
    clock24: rawSettings.clock24 || false,
    weatherCity: rawSettings.weatherCity || '',
    bgType: rawSettings.bgType || 'animated',
    bgValue: rawSettings.bgValue || '',
    customRssName: rawSettings.customRssName || '',
    customRssUrl: rawSettings.customRssUrl || '',
    compactMode: rawSettings.compactMode || false,
    visibility: rawSettings.visibility || defaultVis,
    // NEW THEME STATE
    themeStyle: rawSettings.themeStyle || 'glass',
    accentColor: rawSettings.accentColor || '#0066cc'
};

function initTheme() {
    let savedTheme = localStorage.getItem('dashboardTheme');
    if(!savedTheme) savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    applyBackground();
    applyVisuals();
}

function toggleTheme() {
    let current = document.documentElement.getAttribute('data-theme');
    let next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dashboardTheme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if(icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
}

function applyBackground() {
    // If a theme explicitly overrides the background in CSS (Terminal/Pixel/Cyberpunk),
    // setting inline background to '' lets the CSS take over.
    // If user explicitly chose 'solid' or 'image', we override the theme's background.
    if(dashSettings.bgType === 'solid') {
        document.body.style.background = dashSettings.bgValue || (document.documentElement.getAttribute('data-theme')==='dark' ? '#141e30' : '#fdfbfb');
    } else if(dashSettings.bgType === 'image') {
        document.body.style.background = `url('${dashSettings.bgValue}') center/cover no-repeat fixed`;
    } else {
        document.body.style.background = '';
    }
}

function adjustColorHover(color, amount) {
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    let r = parseInt(hex.substring(0, 2), 16) + amount;
    let g = parseInt(hex.substring(2, 4), 16) + amount;
    let b = parseInt(hex.substring(4, 6), 16) + amount;
    r = Math.max(0, Math.min(255, r)).toString(16).padStart(2, '0');
    g = Math.max(0, Math.min(255, g)).toString(16).padStart(2, '0');
    b = Math.max(0, Math.min(255, b)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function applyVisuals() {
    const root = document.documentElement;

    // Inject Theme Style Class
    root.setAttribute('data-theme-style', dashSettings.themeStyle);

    // Inject Custom Accent Color
    if(dashSettings.accentColor) {
        root.style.setProperty('--accent', dashSettings.accentColor);
        root.style.setProperty('--accent-hover', adjustColorHover(dashSettings.accentColor, -20));
    }

    // Dynamic Iconography Weight
    const iconWeight = getThemeIconWeight();

    // Swap icon weights in the DOM
    document.querySelectorAll('i[class*="ph-"]').forEach(icon => {
        // Skip explicitly filled icons if they are structural, but if material we want mostly filled
        if(icon.classList.contains('ph-fill') && dashSettings.themeStyle !== 'material') return;

        // Remove existing weight classes
        icon.classList.remove('ph-thin', 'ph-light', 'ph-regular', 'ph-bold', 'ph-fill', 'ph-duotone');

        // Add the new weight class
        icon.classList.add(iconWeight);
    });
}

function getThemeIconWeight() {
    let iconWeight = 'ph-regular';
    if (dashSettings.themeStyle === 'glass') iconWeight = 'ph-thin';
    else if (dashSettings.themeStyle === 'brutalism') iconWeight = 'ph-bold';
    else if (dashSettings.themeStyle === 'terminal') iconWeight = 'ph-bold';
    else if (dashSettings.themeStyle === 'pixel') iconWeight = 'ph-bold';
    else if (dashSettings.themeStyle === 'material') iconWeight = 'ph-fill';
    else if (dashSettings.themeStyle === 'cyberpunk') iconWeight = 'ph-light';
    else if (dashSettings.themeStyle === 'e-ink') iconWeight = 'ph-bold';
    return iconWeight;
}

// Observe DOM mutations to apply icon weights to dynamically added elements
const iconObserver = new MutationObserver(mutations => {
    const iconWeight = getThemeIconWeight();

    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // ELEMENT_NODE
                if (node.tagName === 'I' && node.className.includes('ph-')) {
                    if(!node.classList.contains('ph-fill') || dashSettings.themeStyle === 'material') {
                        node.classList.remove('ph-thin', 'ph-light', 'ph-regular', 'ph-bold', 'ph-fill', 'ph-duotone');
                        node.classList.add(iconWeight);
                    }
                }
                // Check children as well
                node.querySelectorAll('i[class*="ph-"]').forEach(icon => {
                    if(!icon.classList.contains('ph-fill') || dashSettings.themeStyle === 'material') {
                        icon.classList.remove('ph-thin', 'ph-light', 'ph-regular', 'ph-bold', 'ph-fill', 'ph-duotone');
                        icon.classList.add(iconWeight);
                    }
                });
            }
        });
    });
});
iconObserver.observe(document.body, { childList: true, subtree: true });

function applyLayoutVisibility() {
    const map = { search: 'mod-search', time: 'mod-time', tasks: 'mod-tasks', torn: 'mod-torn', bank: 'mod-bank-apps', weather: 'mod-weather', calendar: 'mod-calendar', shortcuts: 'mod-shortcuts', notepad: 'mod-notepad', news: 'mod-news' };

    for (let key in map) {
        const el = document.getElementById(map[key]);
        if (el) {
            if(dashSettings.visibility[key] === false) {
                el.style.display = 'none';
            } else {
                el.style.display = 'flex';
            }
        }
    }

    if (dashSettings.compactMode) document.body.classList.add('compact-mode');
    else document.body.classList.remove('compact-mode');
}

function initCustomRssTab() {
    const customTab = document.getElementById('tab-custom');
    if(customTab) {
        if (dashSettings.customRssUrl && dashSettings.customRssName) {
            customTab.style.display = 'block';
            customTab.innerText = dashSettings.customRssName;
        } else {
            customTab.style.display = 'none';
            if (currentNewsCategory === 'custom') fetchNews('dailystar'); // fallback
        }
    }
}

function openSettings() {
    document.getElementById('set-name').value = dashSettings.name;
    document.getElementById('set-clock24').checked = dashSettings.clock24;
    document.getElementById('set-weather').value = dashSettings.weatherCity;
    document.getElementById('set-rss-name').value = dashSettings.customRssName || '';
    document.getElementById('set-rss-url').value = dashSettings.customRssUrl || '';

    // Visuals
    document.getElementById('set-theme').value = dashSettings.themeStyle || 'glass';
    document.getElementById('set-accent').value = dashSettings.accentColor || '#0066cc';

    // Layout Toggles
    document.getElementById('set-compact').checked = dashSettings.compactMode;
    Object.keys(defaultVis).forEach(k => {
        const chk = document.getElementById(`vis-${k}`);
        if(chk) chk.checked = dashSettings.visibility[k] !== false;
    });

    selectBgType(dashSettings.bgType);
    document.getElementById('set-bg-val').value = dashSettings.bgValue;
    document.getElementById('settings-modal').classList.add('active');
}

function closeSettings() { document.getElementById('settings-modal').classList.remove('active'); }
function closeSettingsOverlay(e) { if(e.target.id === 'settings-modal') closeSettings(); }

function selectBgType(type) {
    document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('bg-btn-'+(type==='animated'?'anim':type));
    if(btn) btn.classList.add('active');
    dashSettings.bgType = type;
    const input = document.getElementById('set-bg-val');
    if(type === 'animated') input.style.display = 'none';
    else { input.style.display = 'block'; input.placeholder = type === 'solid' ? "Hex code (e.g. #2c3e50)" : "Image URL (https://...)"; }
}

function saveSettings() {
    dashSettings.name = document.getElementById('set-name').value.trim();
    dashSettings.clock24 = document.getElementById('set-clock24').checked;
    dashSettings.customRssName = document.getElementById('set-rss-name').value.trim();
    dashSettings.customRssUrl = document.getElementById('set-rss-url').value.trim();

    // Visuals
    dashSettings.themeStyle = document.getElementById('set-theme').value;
    dashSettings.accentColor = document.getElementById('set-accent').value;

    // Layout Toggles
    dashSettings.compactMode = document.getElementById('set-compact').checked;
    Object.keys(defaultVis).forEach(k => {
        const chk = document.getElementById(`vis-${k}`);
        if(chk) dashSettings.visibility[k] = chk.checked;
    });

    const oldCity = dashSettings.weatherCity;
    dashSettings.weatherCity = document.getElementById('set-weather').value.trim();
    dashSettings.bgValue = document.getElementById('set-bg-val').value.trim();

    localStorage.setItem('dashSettings', JSON.stringify(dashSettings));
    applyBackground();
    applyVisuals();
    applyLayoutVisibility();
    initCustomRssTab();
    closeSettings();
    startClock();
    triggerMasonryUpdate();

    if(oldCity !== dashSettings.weatherCity) {
        const wc = document.getElementById('weather-container');
        if(wc) wc.innerHTML = '<div class="loading">Tracking atmospheric data...</div>';
        fetchWeatherForCity();
    }
}

const STORAGE_KEYS = {
    todos: 'dashboardTodos',
    bookmarks: 'dashboardBookmarks',
    notes: 'dashboardNotes',
    layout: 'dashboardLayout',
    settings: 'dashSettings',
    theme: 'dashboardTheme',
    holiday: 'holidayState',
    weather: 'weatherCardState',
    tornConfig: 'dashboardTornTracker',
    bankApps: 'dashboardBankApps',
    tornStats: 'tornStatsState'
};

function exportData() {
    const data = Object.entries(STORAGE_KEYS).reduce((acc, [key, storageKey]) => {
        acc[key] = localStorage.getItem(storageKey);
        return acc;
    }, {});
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = `dashboard_backup_${Date.now()}.json`;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
                if (data[key]) localStorage.setItem(storageKey, data[key]);
            });
            alert("Backup restored! Reloading..."); location.reload();
        } catch(err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
}


// --- SUB-ITEM DRAG & DROP ENGINE ---
let dragSrcEl = null; let dragType = null;
function handleSubDragStart(e, type) {
    e.stopPropagation();
    dragSrcEl = e.target.closest('li, .shortcut-item, .bank-app-wrapper');
    dragType = type;
    dragSrcEl.classList.add('dragging-item');
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', dragSrcEl.innerHTML);
}
function handleSubDragOver(e) { e.preventDefault(); return false; }
function handleSubDrop(e, type, arrayObj, saveFunc, renderFunc) {
    e.stopPropagation(); e.preventDefault();
    if (dragSrcEl && dragType === type) {
        const target = e.target.closest('li, .shortcut-item, .bank-app-wrapper');
        if(target && target !== dragSrcEl) {
            const list = Array.from(target.parentNode.children);
            const srcIndex = list.indexOf(dragSrcEl); const targetIndex = list.indexOf(target);
            const movedItem = arrayObj.splice(srcIndex, 1)[0];
            arrayObj.splice(targetIndex, 0, movedItem);
            saveFunc(); renderFunc();
        }
    }
    return false;
}
function handleSubDragEnd(e) { if(dragSrcEl) dragSrcEl.classList.remove('dragging-item'); dragSrcEl = null; dragType = null; }

// --- MASONRY ENGINE ---
function triggerMasonryUpdate() {
    setTimeout(() => {
        document.querySelectorAll('.card').forEach(card => {
            if(window.getComputedStyle(card).display === 'none') return;

            if(card.id === 'mod-search') {
                card.style.gridRowEnd = `span ${Math.ceil(card.getBoundingClientRect().height) + 20}`;
                return;
            }
            card.style.gridRowEnd = `span ${Math.ceil(card.getBoundingClientRect().height) + 20}`;
        });
    }, 50);
}

function toggleSection(contentId, chevronId, storageKey) {
    const content = document.getElementById(contentId); const chevron = document.getElementById(chevronId);
    if (!content) return;
    if (content.style.display === 'none') { content.style.display = contentId === 'weather-details-view' ? 'flex' : 'block'; chevron.classList.add('open'); localStorage.setItem(storageKey, 'open'); }
    else { content.style.display = 'none'; chevron.classList.remove('open'); localStorage.setItem(storageKey, 'closed'); }
    triggerMasonryUpdate();
}

// --- MAIN CARD DRAG AND DROP ENGINE ---
function initDragAndDrop() {
    const dashboard = document.getElementById('dashboard-grid');
    let draggedItem = null;
    const savedOrder = JSON.parse(localStorage.getItem('dashboardLayout'));

    const searchEl = document.getElementById('mod-search');

    if (savedOrder && savedOrder.length > 0) {
        if(searchEl) dashboard.appendChild(searchEl); // Lock search to top
        savedOrder.forEach(id => { const el = document.getElementById(id); if (el && id !== 'mod-search') dashboard.appendChild(el); });
        document.querySelectorAll('.card').forEach(c => { if(!savedOrder.includes(c.id) && c.id !== 'mod-search') dashboard.appendChild(c); });
    }

    document.querySelectorAll('.card').forEach(card => {
        const handle = card.querySelector('.drag-handle');
        if (handle) {
            handle.addEventListener('mouseenter', () => card.setAttribute('draggable', 'true'));
            handle.addEventListener('mouseleave', () => card.setAttribute('draggable', 'false'));
        }
        card.addEventListener('dragstart', function(e) {
            if (e.target !== this) return;
            draggedItem = this; setTimeout(() => this.classList.add('dragging'), 0);
        });
        card.addEventListener('dragend', function() {
            this.classList.remove('dragging'); this.setAttribute('draggable', 'false'); draggedItem = null;
            const currentLayout = Array.from(dashboard.children).filter(c => c.id !== 'mod-search').map(c => c.id);
            localStorage.setItem('dashboardLayout', JSON.stringify(currentLayout));
            triggerMasonryUpdate();
        });
    });

    dashboard.addEventListener('dragover', e => {
        e.preventDefault();
        if (!draggedItem || draggedItem.classList.contains('todo-item') || draggedItem.classList.contains('shortcut-item') || draggedItem.classList.contains('bank-app-wrapper')) return;
        const target = e.target.closest('.card');
        if (target && target !== draggedItem && !target.classList.contains('dragging') && target.id !== 'mod-search') {
            const children = Array.from(dashboard.children);
            if (children.indexOf(draggedItem) < children.indexOf(target)) target.after(draggedItem);
            else target.before(draggedItem);
        }
    });
}

// --- 1. CLOCK ---
function startClock() {
    let hijriFormatter = null;
    try { hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch(e) { const hw = document.getElementById('hijri-wrapper'); if(hw) hw.style.display = 'none'; }

    function updateTime() {
        const now = new Date(); const hour = now.getHours(); const min = now.getMinutes();
        let greeting = "Good Evening"; let iconClass = "ph-moon-stars";
        if (hour >= 5 && hour < 12) { greeting = "Good Morning"; iconClass = "ph-sun-horizon"; }
        else if (hour >= 12 && hour < 17) { greeting = "Good Afternoon"; iconClass = "ph-sun"; }

        document.getElementById('greeting').innerText = dashSettings.name ? `${greeting}, ${dashSettings.name}` : greeting;
        document.getElementById('clock-icon').className = `ph-fill ${iconClass} clock-greeting-icon`;

        let hrShow = hour; let ampm = "";
        if(!dashSettings.clock24) { hrShow = hour % 12; if(hrShow === 0) hrShow = 12; ampm = hour >= 12 ? 'PM' : 'AM'; }

        document.getElementById('time-hr').innerText = hrShow < 10 && dashSettings.clock24 ? '0'+hrShow : hrShow;
        document.getElementById('time-min').innerText = min < 10 ? '0' + min : min;
        document.getElementById('time-ampm').innerText = ampm;
        document.getElementById('date-main').innerHTML = `<i class="ph ph-calendar-blank"></i> ` + now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        if (hijriFormatter) {
            try {
                let hDate = hijriFormatter.format(now);
                if(!hDate.includes('AH')) hDate += " AH";
                document.getElementById('hijri-main').innerText = hDate;
            } catch(e){}
        }

        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weekOfYear = Math.ceil(dayOfYear / 7);
        document.getElementById('week-display').innerText = `Week ${weekOfYear} | Day ${dayOfYear}`;
        document.getElementById('day-progress').style.width = `${((hour * 3600 + min * 60 + now.getSeconds()) / 86400) * 100}%`;
    }
    updateTime(); setInterval(updateTime, 1000);
}

// --- INIT APP ---
function initDashboard() {
    initTheme();
    applyLayoutVisibility();

    if (localStorage.getItem('holidayState') === 'open') { document.getElementById('holiday-list').style.display = 'block'; document.getElementById('holiday-chevron').classList.add('open'); }

    if (localStorage.getItem('tornStatsState') === 'open') {
        const tsv = document.getElementById('torn-stats-view');
        const tsc = document.getElementById('torn-stats-chevron');
        if(tsv && tsc) { tsv.style.display = 'grid'; tsc.classList.add('open'); }
    }

    initCustomRssTab();
    triggerMasonryUpdate(); startClock(); fetchWeatherForCity(); initTornTracker();
    loadBDHolidays(new Date().getFullYear()); fetchNews('dailystar'); renderTodos(); initNotesEngine(); initShortcutsEngine(); initDragAndDrop(); initBankApps();
}

// --- CUSTOM BANK APPS MODULE ---
let bankAppsArr = JSON.parse(localStorage.getItem('dashboardBankApps')) || [
    { name: 'Calculators', icon: 'ph-calculator', path: 'calculator.html' },
    { name: 'Form Gen', icon: 'ph-file-text', path: 'form_generator.html' },
    { name: 'Prepaid Card', icon: 'ph-credit-card', path: 'prepaid_card.html' },
    { name: 'RTGS Gen', icon: 'ph-bank', path: 'rtgs_generator.html' }
];

function initBankApps() { renderBankApps(); }
function saveBankApps() { localStorage.setItem('dashboardBankApps', JSON.stringify(bankAppsArr)); }

function toggleBankAppInputs() {
    const container = document.getElementById('bank-app-inputs-container');
    if (container.style.display === 'none') { container.style.display = 'flex'; document.getElementById('ba-name').focus(); }
    else { container.style.display = 'none'; }
    triggerMasonryUpdate();
}

function renderBankApps() {
    const grid = document.getElementById('bank-apps-grid');
    if(!grid) return;
    grid.innerHTML = '';

    if (bankAppsArr.length === 0) { grid.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px; grid-column: span 2;">No tools added.</div>'; triggerMasonryUpdate(); return; }

    let html = '';
    bankAppsArr.forEach((app, i) => {
        html += `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${app.path}" target="_blank" class="app-tile">
                    <i class="ph-fill ${app.icon}"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button class="delete-btn bank-del-btn" aria-label="Remove Tool" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`;
    });
    grid.innerHTML = html;
    triggerMasonryUpdate();
}

function addBankApp() {
    const n = document.getElementById('ba-name'), ic = document.getElementById('ba-icon'), p = document.getElementById('ba-path');
    if (n.value.trim() && p.value.trim()) {
        let iconClass = ic.value.trim() || 'ph-app-window';
        bankAppsArr.push({ name: n.value.trim(), icon: iconClass, path: p.value.trim() });
        saveBankApps(); renderBankApps();
        n.value = ''; ic.value = ''; p.value = ''; toggleBankAppInputs();
    }
}
function handleBankAppKeyPress(e) { if (e.key === 'Enter') addBankApp(); }
function deleteBankApp(i, event) {
    event.preventDefault(); event.stopPropagation();
    if(confirm("Remove this tool from the dashboard?")) {
        bankAppsArr.splice(i, 1); saveBankApps(); renderBankApps();
    }
}


// --- 3. TORN CITY TRACKER MODULE ---
let tornConfig = JSON.parse(localStorage.getItem('dashboardTornTracker')) || { key: '' };
let tornInterval;
let tornTimers = {};
let tornTickInterval;

function initTornTracker() {
    if(tornConfig.key) {
        fetchTornData();
        if(tornInterval) clearInterval(tornInterval);
        tornInterval = setInterval(fetchTornData, 60000);

        if(tornTickInterval) clearInterval(tornTickInterval);
        tornTickInterval = setInterval(updateTornTimersUI, 1000);
    } else {
        resetTornUI();
    }
}

function toggleTornConfig() {
    const configView = document.getElementById('torn-config-view');
    const displayView = document.getElementById('torn-display-view');

    if (configView.style.display === 'none') {
        document.getElementById('torn-cfg-key').value = tornConfig.key;
        configView.style.display = 'flex';
        displayView.style.display = 'none';
    } else {
        configView.style.display = 'none';
        displayView.style.display = 'flex';
    }
    triggerMasonryUpdate();
}

function saveTornConfig() {
    tornConfig.key = document.getElementById('torn-cfg-key').value.trim();
    localStorage.setItem('dashboardTornTracker', JSON.stringify(tornConfig));
    toggleTornConfig();
    initTornTracker();
}

function resetTornUI() {
    ['en', 'ne', 'ha', 'li'].forEach(prefix => {
        const valEl = document.getElementById(`torn-${prefix}-val`);
        const barEl = document.getElementById(`torn-${prefix}-bar`);
        const fullEl = document.getElementById(`torn-${prefix}-full`);
        if(valEl) valEl.innerText = "-- / --";
        if(barEl) barEl.style.width = "0%";
        if(fullEl) fullEl.innerText = "";
    });
    const pName = document.getElementById('torn-profile-name');
    const pStatus = document.getElementById('torn-profile-status');
    const tCash = document.getElementById('torn-cash');
    if(pName) pName.innerText = "Not Configured";
    if(pStatus) pStatus.innerText = "--";
    if(tCash) tCash.innerText = "$0";
    ['med', 'drug', 'boo'].forEach(prefix => {
        const cdEl = document.getElementById(`torn-cd-${prefix}`);
        if(cdEl) cdEl.innerText = "Ready";
    });
    triggerMasonryUpdate();
}

async function fetchTornData() {
    if(!tornConfig.key) return;

    try {
        const response = await fetch(`https://api.torn.com/user/?selections=bars,profile,cooldowns,travel,money,battlestats,workstats,jobpoints&key=${tornConfig.key}`);
        if(!response.ok) throw new Error("Fetch failed");
        const data = await response.json();

        if(data.error) {
            console.error("Torn API Error:", data.error.error);
            const pn = document.getElementById('torn-profile-name');
            if(pn) pn.innerText = "Invalid API Key";
            return;
        }

        // Profile & Status
        const pn = document.getElementById('torn-profile-name');
        if(pn) pn.innerText = `${data.name} [${data.level}]`;
        let cleanStatus = data.status.description.replace(/<[^>]*>?/gm, '');
        const ps = document.getElementById('torn-profile-status');
        if(ps) ps.innerText = cleanStatus;

        // Money
        const tcash = document.getElementById('torn-cash');
        if(tcash) tcash.innerText = '$' + data.money_onhand.toLocaleString('en-US');

        // Bars
        updateTornBar('en', data.energy);
        updateTornBar('ne', data.nerve);
        updateTornBar('ha', data.happy);
        updateTornBar('li', data.life);

        // Save Timers for Local Ticking
        const now = Date.now();

        let travelUntil = 0;
        if (data.travel && data.travel.time_left > 0) {
            travelUntil = now + data.travel.time_left * 1000;
        } else if (data.status && data.status.until > 0) {
            travelUntil = data.status.until * 1000;
        }

        tornTimers = {
            enFull: now + data.energy.fulltime * 1000,
            enTick: data.energy.ticktime ? now + data.energy.ticktime * 1000 : 0,
            neFull: now + data.nerve.fulltime * 1000,
            neTick: data.nerve.ticktime ? now + data.nerve.ticktime * 1000 : 0,
            haFull: now + data.happy.fulltime * 1000,
            haTick: data.happy.ticktime ? now + data.happy.ticktime * 1000 : 0,
            liFull: now + data.life.fulltime * 1000,
            liTick: data.life.ticktime ? now + data.life.ticktime * 1000 : 0,
            medCd: now + data.cooldowns.medical * 1000,
            drugCd: now + data.cooldowns.drug * 1000,
            booCd: now + data.cooldowns.booster * 1000,
            travel: travelUntil
        };

        // Render Dynamic Stats
        renderTornStats(data);

        updateTornTimersUI();
        triggerMasonryUpdate();

    } catch (e) {
        console.error("Failed to fetch Torn data", e);
    }
}

function renderTornStats(data) {
    const statsView = document.getElementById('torn-stats-view');
    if (!statsView) return;
    statsView.innerHTML = '';

    const frag = document.createDocumentFragment();
    const formatNum = (num) => typeof num === 'number' ? num.toLocaleString('en-US') : (num || '--');

    // Helper for creating micro-card rows
    const createRow = (labelStr, valStr) => {
        const row = document.createElement('div');
        row.className = 'torn-mc-row';

        const label = document.createElement('span');
        label.className = 'torn-mc-label';
        label.textContent = labelStr;

        const dots = document.createElement('div');
        dots.className = 'torn-mc-dots';

        const val = document.createElement('span');
        val.className = 'torn-mc-val';
        val.textContent = valStr;

        row.appendChild(label);
        row.appendChild(dots);
        row.appendChild(val);
        return row;
    };

    // --- GENERAL & ASSETS (PILLS) ---
    let hasPoints = data.points !== undefined;
    let hasJp = (data.jobpoints && (data.jobpoints.jobs || data.jobpoints.companies));

    if (hasPoints || hasJp) {
        const pillsContainer = document.createElement('div');
        pillsContainer.className = 'torn-stats-pills';

        if (hasPoints) {
            const pill = document.createElement('div');
            pill.className = 'torn-stat-pill';
            pill.innerHTML = `Points: <span>${formatNum(data.points)}</span>`;
            pillsContainer.appendChild(pill);
        }
        if (hasJp) {
            let totalJp = 0;
            if (data.jobpoints.jobs) Object.values(data.jobpoints.jobs).forEach(v => totalJp += v);
            if (data.jobpoints.companies) Object.values(data.jobpoints.companies).forEach(v => totalJp += v);

            const pill = document.createElement('div');
            pill.className = 'torn-stat-pill';
            pill.innerHTML = `Job Points: <span>${formatNum(totalJp)}</span>`;
            pillsContainer.appendChild(pill);
        }
        frag.appendChild(pillsContainer);
    }

    // --- GRID LAYOUT ---
    const gridContainer = document.createElement('div');
    gridContainer.className = 'torn-stats-grid';

    // Column 1: Working Stats
    const col1 = document.createElement('div');
    col1.className = 'torn-stats-col';

    let hasWork = data.manual_labor !== undefined || data.intelligence !== undefined || data.endurance !== undefined;
    if (hasWork) {
        const workCard = document.createElement('div');
        workCard.className = 'torn-micro-card';

        const header = document.createElement('div');
        header.className = 'torn-mc-header';
        header.innerHTML = '<i class="ph-fill ph-wrench"></i> Working Stats';
        workCard.appendChild(header);

        if (data.manual_labor !== undefined) workCard.appendChild(createRow('Manual Labor', formatNum(data.manual_labor)));
        if (data.intelligence !== undefined) workCard.appendChild(createRow('Intelligence', formatNum(data.intelligence)));
        if (data.endurance !== undefined) workCard.appendChild(createRow('Endurance', formatNum(data.endurance)));

        col1.appendChild(workCard);
    }

    // Column 2: Battle Stats
    const col2 = document.createElement('div');
    col2.className = 'torn-stats-col';

    let str = data.strength || (data.strength_info ? data.strength_info.effective : undefined);
    let def = data.defense || (data.defense_info ? data.defense_info.effective : undefined);
    let spd = data.speed || (data.speed_info ? data.speed_info.effective : undefined);
    let dex = data.dexterity || (data.dexterity_info ? data.dexterity_info.effective : undefined);

    let hasBattle = str !== undefined || def !== undefined || spd !== undefined || dex !== undefined || data.total_stats !== undefined;
    if (hasBattle) {
        const battleCard = document.createElement('div');
        battleCard.className = 'torn-micro-card';

        const header = document.createElement('div');
        header.className = 'torn-mc-header';
        header.innerHTML = '<i class="ph-fill ph-sword"></i> Battle Stats';
        battleCard.appendChild(header);

        if (str !== undefined) battleCard.appendChild(createRow('Strength', formatNum(str)));
        if (def !== undefined) battleCard.appendChild(createRow('Defense', formatNum(def)));
        if (spd !== undefined) battleCard.appendChild(createRow('Speed', formatNum(spd)));
        if (dex !== undefined) battleCard.appendChild(createRow('Dexterity', formatNum(dex)));

        let totalStat = data.total_stats;
        if (totalStat === undefined && str !== undefined && def !== undefined && spd !== undefined && dex !== undefined) {
             totalStat = str + def + spd + dex;
        }

        if (totalStat !== undefined) {
            const totalRow = document.createElement('div');
            totalRow.className = 'torn-mc-total';

            const tLabel = document.createElement('span');
            tLabel.className = 'torn-mc-total-label';
            tLabel.textContent = 'Total';

            const tVal = document.createElement('span');
            tVal.className = 'torn-mc-total-val';
            tVal.textContent = formatNum(totalStat);

            totalRow.appendChild(tLabel);
            totalRow.appendChild(tVal);
            battleCard.appendChild(totalRow);
        }

        col2.appendChild(battleCard);
    }

    if (hasWork || hasBattle) {
        gridContainer.appendChild(col1);
        gridContainer.appendChild(col2);
        frag.appendChild(gridContainer);
    }

    if(frag.childNodes.length === 0) {
        const noStats = document.createElement('div');
        noStats.style.textAlign = "center";
        noStats.style.color = "var(--text-muted)";
        noStats.style.fontSize = "0.85rem";
        noStats.textContent = "No advanced stats mapped.";
        frag.appendChild(noStats);
    }

    statsView.appendChild(frag);
}

function updateTornBar(prefix, barData) {
    if(!barData) return;
    const cur = barData.current;
    const max = barData.maximum;
    const pct = Math.min(100, Math.max(0, (cur / max) * 100));

    const ve = document.getElementById(`torn-${prefix}-val`);
    const be = document.getElementById(`torn-${prefix}-bar`);
    if(ve) ve.innerText = `${cur} / ${max}`;
    if(be) be.style.width = `${pct}%`;
}

function updateTornTimersUI() {
    if(!tornTimers.enFull) return;

    const now = Date.now();

    const formatSeconds = (s) => {
        if(s <= 0) return '';
        let h = Math.floor(s / 3600);
        let m = Math.floor((s % 3600) / 60);
        let sec = s % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${sec}s`;
        return `${sec}s`;
    };

    const fmtFull = (tickTarget, fullTarget) => {
        let tickStr = '';
        if (tickTarget && tickTarget > now) {
            tickStr = formatSeconds(Math.floor((tickTarget - now) / 1000));
        }

        let fullStr = '';
        if (fullTarget && fullTarget > now) {
            fullStr = formatSeconds(Math.floor((fullTarget - now) / 1000));
        }

        if (tickStr && fullStr) return `(Next in ${tickStr} | Full in ${fullStr})`;
        if (fullStr) return `(Full in ${fullStr})`;
        return '';
    };

    const fmtCd = (target, elId) => {
        let s = Math.floor((target - now) / 1000);
        const el = document.getElementById(elId);
        if(!el) return;
        if(s <= 0) {
            el.innerText = 'Ready';
            el.style.color = 'var(--text-main)';
            return;
        }
        let h = Math.floor(s / 3600).toString().padStart(2, '0');
        let m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        let sec = (s % 60).toString().padStart(2, '0');
        el.innerText = `(In ${h}:${m}:${sec})`;
        el.style.color = 'var(--danger)';
    };

    const en = document.getElementById('torn-en-full'); if(en) en.innerText = fmtFull(tornTimers.enTick, tornTimers.enFull);
    const ne = document.getElementById('torn-ne-full'); if(ne) ne.innerText = fmtFull(tornTimers.neTick, tornTimers.neFull);
    const ha = document.getElementById('torn-ha-full'); if(ha) ha.innerText = fmtFull(tornTimers.haTick, tornTimers.haFull);
    const li = document.getElementById('torn-li-full'); if(li) li.innerText = fmtFull(tornTimers.liTick, tornTimers.liFull);

    fmtCd(tornTimers.medCd, 'torn-cd-med');
    fmtCd(tornTimers.drugCd, 'torn-cd-drug');
    fmtCd(tornTimers.booCd, 'torn-cd-boo');

    const ps = document.getElementById('torn-profile-status');
    if (ps && tornTimers.travel > now) {
        let s = Math.floor((tornTimers.travel - now) / 1000);
        let h = Math.floor(s / 3600).toString().padStart(2, '0');
        let m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        let sec = (s % 60).toString().padStart(2, '0');

        let originalText = ps.getAttribute('data-original-status') || ps.innerText;
        if (!ps.hasAttribute('data-original-status')) {
            ps.setAttribute('data-original-status', originalText);
        }

        let destinationText = originalText;
        if (destinationText.includes('Traveling')) {
             destinationText = destinationText.replace(/\s*\[.*?\]\s*/, ' ');
        }

        ps.innerText = `${destinationText.trim()} [${h}:${m}:${sec}]`;
    } else if (ps && ps.hasAttribute('data-original-status')) {
        ps.innerText = ps.getAttribute('data-original-status');
        ps.removeAttribute('data-original-status');
    }
}


// --- 2. MULTI-TAB TASKS ---
let storedTodos = JSON.parse(localStorage.getItem('dashboardTodos'));
let todos = { work: [], personal: [], coding: [] };
let activeTaskTab = 'work';

if (Array.isArray(storedTodos)) {
    todos.work = storedTodos;
    saveTodos();
} else if (storedTodos && typeof storedTodos === 'object') {
    todos = storedTodos;
}

function switchTaskTab(tabName) {
    activeTaskTab = tabName;
    document.querySelectorAll('#mod-tasks .news-tab').forEach(t => t.classList.remove('active'));
    const tt = document.getElementById('task-tab-' + tabName);
    if(tt) tt.classList.add('active');
    renderTodos();
}

function saveTodos() { localStorage.setItem('dashboardTodos', JSON.stringify(todos)); }

function renderTodos() {
    const currentList = todos[activeTaskTab] || [];
    const tc = document.getElementById('task-count');
    if(tc) tc.innerText = `(${currentList.filter(t => !t.completed).length})`;
    const list = document.getElementById('todo-list');
    if(!list) return;
    list.innerHTML = currentList.length === 0 ? '<li style="text-align:center; color:var(--text-muted); padding: 30px 0; font-weight: 500;">All caught up!</li>' : '';

    let html = list.innerHTML;
    currentList.forEach((t, i) => {
        html += `
        <li class="todo-item ${t.completed ? 'completed' : ''}" draggable="true" ondragstart="handleSubDragStart(event, 'task')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'task', todos['${activeTaskTab}'], saveTodos, renderTodos)" ondragend="handleSubDragEnd(event)">
            <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></div>
            <input type="checkbox" aria-label="Toggle task completion" ${t.completed ? 'checked' : ''} onchange="toggleTodo(${i})">
            <span class="todo-text" onclick="toggleTodo(${i})">${escapeHtml(t.text)}</span>
            <button class="delete-btn" aria-label="Delete task" onclick="deleteTodo(${i})" title="Delete task">&times;</button>
        </li>`;
    });
    list.innerHTML = html;
    triggerMasonryUpdate();
}
function addTodo() {
    const i = document.getElementById('todo-input');
    if (i && i.value.trim()) {
        todos[activeTaskTab].push({ text: i.value.trim(), completed: false });
        i.value = '';
        saveTodos(); renderTodos();
    }
}
function handleTodoKeyPress(e) { if (e.key === 'Enter') addTodo(); }
function toggleTodo(i) { todos[activeTaskTab][i].completed = !todos[activeTaskTab][i].completed; saveTodos(); renderTodos(); }
function deleteTodo(i) { todos[activeTaskTab].splice(i, 1); saveTodos(); renderTodos(); }
function clearCompletedTodos() { todos[activeTaskTab] = todos[activeTaskTab].filter(t => !t.completed); saveTodos(); renderTodos(); }


// --- 4. WEATHER ---
async function fetchWeatherForCity() {
    if(dashSettings.weatherCity) {
        try {
            const gRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(dashSettings.weatherCity)}&count=1&language=en&format=json`);
            const gData = await gRes.json();
            if(gData.results && gData.results.length > 0) fetchWeather(gData.results[0].latitude, gData.results[0].longitude, gData.results[0].name);
            else throw new Error();
        } catch(e) { renderWeatherError(); }
    } else { getLocationFromIP(); }
}

function getLocationFromIP() {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            if(data.error) throw new Error();
            fetchWeather(data.latitude, data.longitude, `${data.city}, ${data.country_name}`);
        })
        .catch(() => {
            fetch('https://ipinfo.io/json')
                .then(res => res.json())
                .then(data => { const [lat, lon] = data.loc.split(','); fetchWeather(lat, lon, `${data.city}, ${data.country}`); })
                .catch(() => renderWeatherError());
        });
}

function renderWeatherError() {
    const wc = document.getElementById('weather-container');
    if(!wc) return;
    wc.innerHTML = `
        <div style="text-align:center; padding: 15px 0;">
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:15px;">Location blocked or unavailable.</div>
            <div class="todo-input-group" style="margin: 0 auto;">
                <input type="text" id="manual-city-input" placeholder="Enter City (e.g. Dhaka)" onkeypress="if(event.key==='Enter') saveManualCity()">
                <button class="btn-add" onclick="saveManualCity()">Go</button>
            </div>
        </div>`;
    triggerMasonryUpdate();
}

function saveManualCity() {
    const city = document.getElementById('manual-city-input').value.trim();
    if(city) { dashSettings.weatherCity = city; localStorage.setItem('dashSettings', JSON.stringify(dashSettings)); document.getElementById('weather-container').innerHTML = '<div class="loading">Fetching...</div>'; fetchWeatherForCity(); }
}

function getLocalMoonPhase() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    let b = parseInt(jd);
    jd -= b;
    b = Math.round(jd * 8);

    if (b >= 8) b = 0;

    const phases = [
        { name: "New Moon", icon: "ph-moon" },
        { name: "Waxing Crescent", icon: "ph-moon" },
        { name: "First Quarter", icon: "ph-moon" },
        { name: "Waxing Gibbous", icon: "ph-moon" },
        { name: "Full Moon", icon: "ph-moon-stars" },
        { name: "Waning Gibbous", icon: "ph-moon" },
        { name: "Last Quarter", icon: "ph-moon" },
        { name: "Waning Crescent", icon: "ph-moon" }
    ];

    return phases[b];
}

function getWeatherDetails(code, isDay = 1) {
    if (code === 0) return { desc: 'Clear', icon: isDay ? '<i class="ph-fill ph-sun" style="color: #fbbc04;"></i>' : '<i class="ph-fill ph-moon" style="color: #a1a1a6;"></i>', bgClass: isDay ? 'weather-bg-clear-day' : 'weather-bg-clear-night' };
    if ([1,2].includes(code)) return { desc: 'Cloudy', icon: isDay ? '<i class="ph-fill ph-cloud-sun" style="color: #fbbc04;"></i>' : '<i class="ph-fill ph-cloud-moon" style="color: #a1a1a6;"></i>', bgClass: isDay ? 'weather-bg-cloudy-day' : 'weather-bg-cloudy-night' };
    if (code === 3) return { desc: 'Overcast', icon: '<i class="ph-fill ph-cloud" style="color: #a1a1a6;"></i>', bgClass: 'weather-bg-overcast' };
    if ([45, 48].includes(code)) return { desc: 'Fog', icon: '<i class="ph-fill ph-cloud-fog" style="color: #a1a1a6;"></i>', bgClass: 'weather-bg-fog' };
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { desc: 'Rain', icon: '<i class="ph-fill ph-cloud-rain" style="color: #4285F4;"></i>', bgClass: 'weather-bg-rain', animClass: 'weather-anim-rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { desc: 'Snow', icon: '<i class="ph-fill ph-cloud-snow" style="color: #8ec5fc;"></i>', bgClass: 'weather-bg-snow', animClass: 'weather-anim-snow' };
    if ([95, 96, 99].includes(code)) return { desc: 'Storm', icon: '<i class="ph-fill ph-cloud-lightning" style="color: #ff9500;"></i>', bgClass: 'weather-bg-storm', animClass: 'weather-anim-rain' };
    return { desc: 'Unknown', icon: '<i class="ph-fill ph-sun"></i>', bgClass: 'weather-bg-clear-day' };
}
function getWindDir(d) { return ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8]; }

function renderWeatherUI(data, aqiData, detailsDisplay) {
    const cur = data.current, day = data.daily, hr = data.hourly;
    const wInfo = getWeatherDetails(cur.weather_code, cur.is_day);

    // --- Apply dynamic weather background ---
    const modWeather = document.getElementById('mod-weather');
    if (modWeather) {
        // Remove existing weather background classes
        modWeather.className = modWeather.className.replace(/\bweather-bg-\S+/g, '');
        modWeather.classList.add(wInfo.bgClass);

        // Handle animated overlay
        let overlay = modWeather.querySelector('.weather-fx-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'weather-fx-overlay';
            modWeather.insertBefore(overlay, modWeather.firstChild);
        }
        overlay.className = 'weather-fx-overlay'; // Reset overlay classes
        if (wInfo.animClass) {
            overlay.classList.add(wInfo.animClass);
        }
    }

    const aqi = aqiData.current.us_aqi;
    const aInfo = aqi<=50 ? {l:'Good',c:'#34c759'} : aqi<=100 ? {l:'Moderate',c:'#ff9500'} : aqi<=150 ? {l:'Unhealthy',c:'#ff3b30'} : {l:'Hazardous',c:'#af52de'};

    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div class="aqi-badge" style="background-color: ${aInfo.c};">AQI: ${Math.round(aqi)} - ${aInfo.l}</div>
            <div class="current-weather-main">
                <div class="weather-icon-large">${wInfo.icon}</div>
                <div class="weather-temp-box"><span class="weather-temp">${Math.round(cur.temperature_2m)}&deg;</span><span class="weather-desc">${wInfo.desc}</span></div>
            </div>
        </div>
        <div id="weather-details-view" style="display: ${detailsDisplay}; flex-direction: column; width: 100%;">
            <div class="weather-stats" style="width: 100%;">
                <div class="stat-item"><span class="stat-label">Feels</span><span class="stat-val">${Math.round(cur.apparent_temperature)}&deg;</span></div>
                <div class="stat-item"><span class="stat-label">Wind</span><span class="stat-val">${Math.round(cur.wind_speed_10m)}k/h ${getWindDir(cur.wind_direction_10m)}</span></div>
                <div class="stat-item"><span class="stat-label">UV Max</span><span class="stat-val">${Math.round(day.uv_index_max[0])}</span></div>
                <div class="stat-item"><span class="stat-label">Humidity</span><span class="stat-val">${cur.relative_humidity_2m}%</span></div>
                <div class="stat-item"><span class="stat-label">Vis.</span><span class="stat-val">${(cur.visibility/1000).toFixed(1)}km</span></div>
                <div class="stat-item"><span class="stat-label">Press.</span><span class="stat-val">${Math.round(cur.surface_pressure)}hPa</span></div>
            </div>
            <div class="sun-cycle" style="width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; padding: 15px 10px 25px 10px; background: var(--inner-bg); border-radius: 16px; margin-bottom: 15px;">
                <div style="width: 100%; max-width: 200px; position: relative; height: 50px; margin-bottom: 10px;">
                    <svg viewBox="0 0 100 55" style="width: 100%; height: 100%; overflow: visible; display: block;">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--glass-border)" stroke-width="2" stroke-dasharray="4 4" />
                        <circle cx="10" cy="50" r="2" fill="var(--text-muted)" />
                        <circle cx="90" cy="50" r="2" fill="var(--text-muted)" />
                        ${(() => {
                            const now = new Date();
                            const sunrise = new Date(day.sunrise[0]);
                            const sunset = new Date(day.sunset[0]);
                            let progress = 0;
                            if (now < sunrise) progress = 0;
                            else if (now > sunset) progress = 1;
                            else progress = (now - sunrise) / (sunset - sunrise);

                            const angle = Math.PI - (progress * Math.PI);
                            const x = 50 + 40 * Math.cos(angle);
                            const y = 50 - 40 * Math.sin(angle);

                            let isSunVisible = now >= sunrise && now <= sunset;

                            if (!isSunVisible) return ''; // Hide sun when it's down

                            return `<g transform="translate(${x}, ${y})">
                                        <circle cx="0" cy="0" r="4" fill="#fbbc04" style="filter: drop-shadow(0 0 4px #fbbc04);" />
                                    </g>`;
                        })()}
                    </svg>
                    <div style="position: absolute; bottom: -22px; left: -10px; font-size: 0.7rem; font-weight: 700; text-align: center; color: var(--text-main);">
                        <i class="ph-fill ph-sunrise" style="color: #fbbc04; font-size: 1.1rem; display: block; margin-bottom: 2px;"></i>
                        ${new Date(day.sunrise[0]).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
                    </div>
                    <div style="position: absolute; bottom: -22px; right: -10px; font-size: 0.7rem; font-weight: 700; text-align: center; color: var(--text-main);">
                        <i class="ph-fill ph-sunset" style="color: #ff9500; font-size: 1.1rem; display: block; margin-bottom: 2px;"></i>
                        ${new Date(day.sunset[0]).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
                    </div>
                </div>
                <div style="margin-top: 30px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 5px;">
                    <i class="ph-fill ${getLocalMoonPhase().icon}" style="font-size: 1.1rem; color: #a1a1a6;"></i>
                    ${getLocalMoonPhase().name}
                </div>
            </div>`;
    let hIdx = hr.time.findIndex(t => t >= new Date().toISOString().slice(0, 14)+"00"); if(hIdx === -1) hIdx = 0;
    html += `<div style="width: 100%;"><div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text-muted);">Hourly</div><div class="hourly-forecast">`;
    for(let i=hIdx+1; i<=hIdx+6; i++) {
        if(!hr.time[i]) break;
        html += `<div class="hourly-item"><span class="hourly-time">${new Date(hr.time[i]).toLocaleTimeString('en-US',{hour:'numeric'})}</span><span class="hourly-icon">${getWeatherDetails(hr.weather_code[i], 1).icon}</span><span class="hourly-temp">${Math.round(hr.temperature_2m[i])}&deg;</span>${hr.precipitation_probability[i]>0 ? `<div class="hourly-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${hr.precipitation_probability[i]}%</div>`:''}</div>`;
    }
    html += `</div></div><div class="forecast-container" style="width: 100%;">`;
    for (let i=1; i<=4; i++) {
        html += `<div class="forecast-day"><span class="fc-name">${new Date(day.time[i]).toLocaleDateString('en-US',{weekday:'short'})}</span><span class="fc-icon">${getWeatherDetails(day.weather_code[i], 1).icon}</span><div class="fc-temps"><span class="fc-max">${Math.round(day.temperature_2m_max[i])}&deg;</span><span class="fc-min">${Math.round(day.temperature_2m_min[i])}&deg;</span></div>${day.precipitation_probability_max[i]>0 ? `<div class="fc-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${day.precipitation_probability_max[i]}%</div>`:''}</div>`;
    }
    const wc = document.getElementById('weather-container');
    if(wc) { wc.innerHTML = html + `</div></div>`; triggerMasonryUpdate(); }
}

async function fetchWeather(lat, lon, locName) {
    const locDisp = document.getElementById('location-display');
    if(locDisp) locDisp.innerText = locName;
    const wState = localStorage.getItem('weatherCardState') || 'closed';
    const detailsDisplay = wState === 'open' ? 'flex' : 'none';
    if (document.getElementById('weather-card-chevron') && wState === 'open') document.getElementById('weather-card-chevron').classList.add('open');

    try {
        const [wRes, aRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`)
        ]);
        const data = await wRes.json(), aqiData = await aRes.json();

        renderWeatherUI(data, aqiData, detailsDisplay);
    } catch(e) { renderWeatherError(); }
}

// --- 5. CALENDAR (Accurate Bangladesh Holidays) ---
let displayedYear = new Date().getFullYear(), displayedMonth = new Date().getMonth();
function jumpToToday() { displayedYear = new Date().getFullYear(); displayedMonth = new Date().getMonth(); renderCalendar(); }
function changeMonth(offset) { displayedMonth += offset; if (displayedMonth < 0) { displayedMonth = 11; displayedYear--; loadBDHolidays(displayedYear); } else if (displayedMonth > 11) { displayedMonth = 0; displayedYear++; loadBDHolidays(displayedYear); } else renderCalendar(); }
let holidaysData = [];

function loadBDHolidays(year) {
    let bdHolidays = [
        { date: `${year}-02-21`, name: "Language Martyrs' Day" },
        { date: `${year}-03-26`, name: "Independence Day" },
        { date: `${year}-04-14`, name: "Bengali New Year" },
        { date: `${year}-05-01`, name: "May Day" },
        { date: `${year}-12-16`, name: "Victory Day" },
        { date: `${year}-12-25`, name: "Christmas Day" }
    ];

    if (year === 2026) {
        bdHolidays = [
            { date: "2026-02-04", name: "Shab e-Barat" },
            { date: "2026-02-11", name: "Election Day" },
            { date: "2026-02-12", name: "Election Day Holiday" },
            { date: "2026-02-21", name: "Language Martyrs' Day" },
            { date: "2026-03-17", name: "Shab-e-Qadr" },
            { date: "2026-03-19", name: "Eid ul-Fitr Holiday" },
            { date: "2026-03-20", name: "Jumatul Bidah / Eid Holiday" },
            { date: "2026-03-21", name: "Eid ul-Fitr" },
            { date: "2026-03-22", name: "Eid ul-Fitr Holiday" },
            { date: "2026-03-23", name: "Eid ul-Fitr Holiday" },
            { date: "2026-03-26", name: "Independence Day" },
            { date: "2026-04-13", name: "Chaitra Sankranti" },
            { date: "2026-04-14", name: "Bengali New Year" },
            { date: "2026-05-01", name: "May Day / Buddha Purnima" },
            { date: "2026-05-26", name: "Eid al-Adha Holiday" },
            { date: "2026-05-27", name: "Eid al-Adha Holiday" },
            { date: "2026-05-28", name: "Eid al-Adha" },
            { date: "2026-05-29", name: "Eid al-Adha Holiday" },
            { date: "2026-05-30", name: "Eid al-Adha Holiday" },
            { date: "2026-05-31", name: "Eid al-Adha Holiday" },
            { date: "2026-06-17", name: "Muharram" },
            { date: "2026-06-26", name: "Ashura" },
            { date: "2026-07-01", name: "Bank Holiday" },
            { date: "2026-08-05", name: "Student-People Uprising Day" },
            { date: "2026-08-26", name: "Eid e-Milad-un Nabi" },
            { date: "2026-09-04", name: "Janmashtami" },
            { date: "2026-10-20", name: "Mahanabami" },
            { date: "2026-10-21", name: "Durga Puja" },
            { date: "2026-12-16", name: "Victory Day" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-31", name: "Bank Holiday" }
        ];
    }

    holidaysData = bdHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderCalendar(); renderHolidayList();
}

function renderCalendar() {
    const actualToday = new Date(), viewDate = new Date(displayedYear, displayedMonth, 1);
    const mn = document.getElementById('calendar-month-name');
    if(mn) mn.innerText = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let html = '<div class="calendar-grid">';
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => html += `<div class="calendar-header">${d}</div>`);
    for (let i = 0; i < viewDate.getDay(); i++) html += `<div class="calendar-day calendar-empty"></div>`;
    for (let i = 1; i <= new Date(displayedYear, displayedMonth + 1, 0).getDate(); i++) {
        const dateStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let isToday = (actualToday.getDate() === i && actualToday.getMonth() === displayedMonth && actualToday.getFullYear() === displayedYear) ? 'calendar-today' : '';
        const hObj = holidaysData.find(h => h.date === dateStr);
        html += `<div class="calendar-day ${isToday} ${hObj ? 'calendar-holiday' : ''}" ${hObj ? `title="${hObj.name}"` : ''}>${i}</div>`;
    }
    const mc = document.getElementById('mini-calendar');
    if(mc) { mc.innerHTML = html + '</div>'; triggerMasonryUpdate(); }
}

function renderHolidayList() {
    const list = document.getElementById('holiday-list');
    if(!list) return;
    const now = new Date(); now.setHours(0,0,0,0);
    const up = holidaysData.filter(h => new Date(h.date) >= now);
    if (up.length === 0) { list.innerHTML = '<li class="holiday-item">No more holidays mapped for this year.</li>'; return; }
    let html = '';
    up.slice(0, 5).forEach(h => {
        const diffDays = Math.ceil(Math.abs(new Date(h.date) - now) / 86400000);
        html += `<li class="holiday-item"><span class="holiday-name">${escapeHtml(h.name)}</span><div class="holiday-meta"><span class="holiday-countdown">${diffDays === 0 ? "Today" : `in ${diffDays}d`}</span><span class="holiday-date">${new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div></li>`;
    });
    list.innerHTML = html;
}

function escapeHtml(u) { return (u || '').replace(/[&<"'>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]); }

// --- 6. QUICK LINKS ---
let shortcutsArr = JSON.parse(localStorage.getItem('dashboardBookmarks')) || [];
function toggleShortcutInputs() {
    const container = document.getElementById('shortcut-inputs-container');
    if (container.style.display === 'none') { container.style.display = 'flex'; document.getElementById('sc-name').focus(); }
    else { container.style.display = 'none'; }
    triggerMasonryUpdate();
}
function initShortcutsEngine() { renderShortcuts(); }
function saveShortcuts() { localStorage.setItem('dashboardBookmarks', JSON.stringify(shortcutsArr)); }
function renderShortcuts() {
    const grid = document.getElementById('shortcuts-grid');
    if(!grid) return;

    if (shortcutsArr.length === 0) { grid.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">No links added yet.</div>'; triggerMasonryUpdate(); return; }

    let html = '';
    shortcutsArr.forEach((sc, i) => {
        let domain = sc.path.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        let favUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        let onErrorFallback = `this.outerHTML='<i class=\\'ph-fill ph-globe shortcut-fallback-icon\\'></i>'`;
        html += `
            <div class="shortcut-item" draggable="true" ondragstart="handleSubDragStart(event, 'link')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'link', shortcutsArr, saveShortcuts, renderShortcuts)" ondragend="handleSubDragEnd(event)">
                <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></div>
                <a href="${sc.path}" target="_blank" style="display:flex; align-items:center; gap:8px; flex-grow:1; text-decoration:none; color:inherit;">
                    <div class="shortcut-icon-wrapper"><img src="${favUrl}" alt="" onerror="${onErrorFallback}"></div>
                    <div class="shortcut-info"><span class="shortcut-name" title="${escapeHtml(sc.name)}">${escapeHtml(sc.name)}</span></div>
                </a>
                <button class="delete-btn" aria-label="Remove Link" onclick="deleteShortcut(${i}, event)" title="Remove Link">&times;</button>
            </div>`;
    });
    grid.innerHTML = html;
    triggerMasonryUpdate();
}
function addShortcut() {
    const n = document.getElementById('sc-name'), p = document.getElementById('sc-path');
    if (n.value.trim() && p.value.trim()) {
        let url = p.value.trim(); if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        shortcutsArr.push({ name: n.value.trim(), path: url }); saveShortcuts(); renderShortcuts(); n.value = ''; p.value = ''; toggleShortcutInputs();
    }
}
function handleShortcutKeyPress(e) { if (e.key === 'Enter') addShortcut(); }
function deleteShortcut(i, event) { event.preventDefault(); event.stopPropagation(); if(confirm("Remove this link?")) { shortcutsArr.splice(i, 1); saveShortcuts(); renderShortcuts(); } }

// --- 7. NORMAL NOTEPAD ---
let notesArr = []; let currentNoteId = null;
function initNotesEngine() {
    let savedNotes = JSON.parse(localStorage.getItem('dashboardNotes'));
    if (!savedNotes) { notesArr = [{ id: Date.now(), title: 'Welcome', content: 'Type your quick notes here.', lastEdited: Date.now(), color: 'none', pinned: false }]; saveNotesArr(); }
    else { notesArr = savedNotes.map(n => ({...n, color: n.color || 'none', pinned: n.pinned || false})); }

    const titleInp = document.getElementById('note-title-input');
    const textarea = document.getElementById('notepad-input');
    if(titleInp) titleInp.addEventListener('input', autoSaveNote);
    if(textarea) {
        textarea.addEventListener('input', () => { updateCharCount(); autoSaveNote(); });
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') { e.preventDefault(); const start = this.selectionStart, end = this.selectionEnd; this.value = this.value.substring(0, start) + "    " + this.value.substring(end); this.selectionStart = this.selectionEnd = start + 4; updateCharCount(); autoSaveNote(); }
        });
    }
    renderNotesList();
}
function saveNotesArr() { localStorage.setItem('dashboardNotes', JSON.stringify(notesArr)); }

function renderNotesList() {
    const list = document.getElementById('notes-list-inject');
    const searchEl = document.getElementById('note-search');
    if(!list || !searchEl) return;

    const searchQ = searchEl.value.toLowerCase();
    let filteredNotes = searchQ ? notesArr.filter(n => n.title.toLowerCase().includes(searchQ) || n.content.toLowerCase().includes(searchQ)) : notesArr;
    if (filteredNotes.length === 0) { list.innerHTML = `<div class="loading">${searchQ ? 'No matches found.' : 'No notes yet. Click + to create.'}</div>`; triggerMasonryUpdate(); return; }

    let html = "";
    [...filteredNotes].sort((a, b) => { if(a.pinned === b.pinned) return b.lastEdited - a.lastEdited; return a.pinned ? -1 : 1; }).forEach(note => {
        const diffMins = Math.floor((Date.now() - note.lastEdited) / 60000);
        let dateStr = diffMins < 1 ? "Just now" : diffMins < 60 ? `${diffMins}m` : diffMins < 1440 ? `${Math.floor(diffMins/60)}h` : new Date(note.lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const pinClass = note.pinned ? 'pinned' : ''; const pinIcon = note.pinned ? 'ph-fill ph-push-pin' : 'ph ph-push-pin';

        html += `
            <div class="note-item color-${note.color} ${pinClass}" onclick="openNote(${note.id})">
                <div class="note-item-content">
                    <div class="note-title">${escapeHtml(note.title.trim() || "Untitled")}</div>
                    <div class="note-excerpt">${escapeHtml(note.content.trim().substring(0, 40)) || "..."}</div>
                </div>
                <div class="note-actions-col">
                    <button class="pin-btn" aria-label="Pin Note" onclick="togglePin(${note.id}, event)" title="Pin Note"><i class="${pinIcon}"></i></button>
                    <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">${dateStr}</span>
                </div>
                <button class="note-delete-btn" aria-label="Delete Note" onclick="deleteNote(${note.id}, event)" title="Delete">&times;</button>
            </div>`;
    });
    list.innerHTML = html;
    triggerMasonryUpdate();
}

function createNewNote() { const newId = Date.now(); notesArr.push({ id: newId, title: '', content: '', lastEdited: newId, color: 'none', pinned: false }); saveNotesArr(); document.getElementById('note-search').value = ""; openNote(newId); }
function openNote(id) {
    currentNoteId = id; const note = notesArr.find(n => n.id === id); if (!note) return;
    document.getElementById('note-title-input').value = note.title; document.getElementById('notepad-input').value = note.content;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active')); document.getElementById(`c-${note.color}`).classList.add('active');
    updateCharCount();
    document.getElementById('notepad-header-title').innerHTML = '<i class="ph ph-notepad" style="margin-right: 8px;"></i>Edit Note';
    document.getElementById('notepad-list-actions').style.display = 'none'; document.getElementById('notepad-list-view').style.display = 'none';
    document.getElementById('notepad-edit-actions').style.display = 'flex'; document.getElementById('notepad-edit-view').style.display = 'flex';
    document.getElementById('notepad-input').focus(); triggerMasonryUpdate();
}
function closeNote() {
    const note = notesArr.find(n => n.id === currentNoteId);
    if (note && note.title.trim() === '' && note.content.trim() === '') { notesArr = notesArr.filter(n => n.id !== currentNoteId); saveNotesArr(); }
    currentNoteId = null; renderNotesList();
    document.getElementById('notepad-header-title').innerHTML = '<i class="ph ph-notepad" style="margin-right: 8px;"></i>Quick Notes';
    document.getElementById('notepad-edit-actions').style.display = 'none'; document.getElementById('notepad-edit-view').style.display = 'none';
    document.getElementById('notepad-list-actions').style.display = 'block'; document.getElementById('notepad-list-view').style.display = 'flex';
    triggerMasonryUpdate();
}
function autoSaveNote() {
    if (!currentNoteId) return; const idx = notesArr.findIndex(n => n.id === currentNoteId);
    if (idx > -1) {
        notesArr[idx].title = document.getElementById('note-title-input').value;
        notesArr[idx].content = document.getElementById('notepad-input').value;
        notesArr[idx].lastEdited = Date.now(); saveNotesArr();
        const status = document.getElementById('note-save-status'); status.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite; margin-right:3px;"></i>Saving';
        clearTimeout(window.saveTimeout); window.saveTimeout = setTimeout(() => { status.innerHTML = '<i class="ph ph-cloud-check" style="margin-right:3px;"></i>Saved'; }, 500);
    }
}
function setNoteColor(color) {
    if (!currentNoteId) return; const idx = notesArr.findIndex(n => n.id === currentNoteId);
    if (idx > -1) { notesArr[idx].color = color; document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active')); document.getElementById(`c-${color}`).classList.add('active'); autoSaveNote(); }
}
function togglePin(id, event) { event.stopPropagation(); let note = notesArr.find(n => n.id === id); if(note) { note.pinned = !note.pinned; saveNotesArr(); renderNotesList(); } }
function deleteNote(id, event) { event.stopPropagation(); if(confirm("Delete this note?")) { notesArr = notesArr.filter(n => n.id !== id); saveNotesArr(); renderNotesList(); } }
function updateCharCount() { const inc = document.getElementById('note-char-count'); if(inc) inc.innerText = `${document.getElementById('notepad-input').value.length} chars`; }
function copyNote() {
    const content = document.getElementById('notepad-input').value;
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(content).then(showCopied); }
    else { const ta = document.createElement("textarea"); ta.value = content; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); showCopied(); } catch (err) {} document.body.removeChild(ta); }
    function showCopied() { const t = document.getElementById('notepad-header-title'); t.innerHTML = '<i class="ph ph-check-circle" style="margin-right: 8px; color: var(--success);"></i>Copied!'; setTimeout(() => t.innerHTML = '<i class="ph ph-notepad" style="margin-right: 8px;"></i>Edit Note', 1500); }
}
function downloadNote() {
    const title = document.getElementById('note-title-input').value.trim() || "note";
    const blob = new Blob([document.getElementById('notepad-input').value], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
}

// --- 8. NEWS HUB ---
let currentNewsCategory = 'dailystar';
function refreshCurrentNews() {
    const btn = document.getElementById('news-refresh-btn'); btn.classList.add('spinning');
    fetchNews(currentNewsCategory, true).then(() => setTimeout(() => btn.classList.remove('spinning'), 500)).catch(() => setTimeout(() => btn.classList.remove('spinning'), 500));
}

const fetchWithTimeout = (url, ms) => Promise.race([ fetch(url), new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)) ]);

async function fetchNewsData(category, forceRefresh) {
    let items = [];
    const feeds = {
        'dailystar': 'https://www.thedailystar.net/frontpage/rss.xml',
        'prothomalo': 'https://en.prothomalo.com/feed/',
        'business': 'https://www.thedailystar.net/business/rss.xml',
        'sports': 'https://www.thedailystar.net/sports/rss.xml',
        'global': 'https://www.aljazeera.com/xml/rss/all.xml',
        'custom': dashSettings.customRssUrl
    };
    const sourcesNames = {
        'dailystar': 'The Daily Star',
        'prothomalo': 'Prothom Alo',
        'business': 'Daily Star Business',
        'sports': 'Daily Star Sports',
        'global': 'Al Jazeera',
        'custom': dashSettings.customRssName || 'Custom Feed'
    };

    let targetFeed = feeds[category];
    const fallbackImg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 256 256' fill='none' stroke='#a1a1a6' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'><rect x='32' y='48' width='192' height='160' rx='8'></rect><line x1='80' y1='104' x2='176' y2='104'></line><line x1='80' y1='144' x2='176' y2='144'></line></svg>");

    const MY_PRIVATE_PROXY = "https://script.google.com/macros/s/AKfycbwRKENOew0rgwnfbdUOYweWKLJkSeEenJD8d_pd_I2hpH6o9pQELRMCoRe00gS3PTIaTg/exec";

    try {
        const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : '';
        let fetchUrl = `${MY_PRIVATE_PROXY}?url=${encodeURIComponent(targetFeed + cacheBuster)}`;

        const res = await fetchWithTimeout(fetchUrl, 8000);
        if (!res.ok) throw new Error("Proxy failed");

        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");

        const nodes = Array.from(xml.querySelectorAll("item")).slice(0, 9);
        if(nodes.length === 0) throw new Error("No XML items");

        nodes.forEach(item => {
            let title = item.querySelector("title")?.textContent || "News Article";
            let link = item.querySelector("link")?.textContent || "#";
            let pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
            let desc = item.querySelector("description")?.textContent || "";
            let content = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || "";

            let imgUrl = fallbackImg;
            let enclosure = item.querySelector("enclosure");
            let mediaContent = item.getElementsByTagNameNS("*", "content")[0];

            if (enclosure && enclosure.getAttribute("url")) imgUrl = enclosure.getAttribute("url");
            else if (mediaContent && mediaContent.getAttribute("url")) imgUrl = mediaContent.getAttribute("url");
            else {
                let match = desc.match(/<img[^>]+src=["']([^"']+)["']/i) || content.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (match) imgUrl = match[1];
            }

            let dateObj = new Date(pubDate.replace(/-/g, '/'));
            let hAgo = Math.floor((Date.now() - dateObj.getTime()) / 3600000);
            let timeStr = isNaN(hAgo) ? "Recently" : (hAgo <= 0 ? "Just now" : hAgo + "h ago");

            items.push({ title, link, imgUrl, source: sourcesNames[category], timeStr });
        });
        return items;
    } catch (error) {
        console.error("News fetch error:", error);
        throw error;
    }
}

function renderNewsItems(items, container) {
    const fallbackImg = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 256 256' fill='none' stroke='#a1a1a6' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'><rect x='32' y='48' width='192' height='160' rx='8'></rect><line x1='80' y1='104' x2='176' y2='104'></line><line x1='80' y1='144' x2='176' y2='144'></line></svg>");
    let html = '<div class="news-list">';
    items.forEach(p => {
        html += `
            <a href="${p.link}" target="_blank" class="news-item">
                <div class="news-image-wrapper"><img src="${p.imgUrl}" class="news-image" alt="Img" onerror="this.src='${fallbackImg}'"></div>
                <div class="news-content"><div class="news-title">${escapeHtml(p.title)}</div><div class="news-source">${p.source} &bull; ${p.timeStr}</div></div>
            </a>`;
    });
    container.innerHTML = html + '</div>';
    triggerMasonryUpdate();
    setTimeout(triggerMasonryUpdate, 800);
}

function renderNewsTabs() {
    const container = document.getElementById('news-tabs-container');
    if (!container) return;

    let html = `
        <div class="news-tab ${currentNewsCategory === 'dailystar' ? 'active' : ''}" id="tab-dailystar" onclick="fetchNews('dailystar')">The Daily Star</div>
        <div class="news-tab ${currentNewsCategory === 'prothomalo' ? 'active' : ''}" id="tab-prothomalo" onclick="fetchNews('prothomalo')">Prothom Alo</div>
        <div class="news-tab ${currentNewsCategory === 'business' ? 'active' : ''}" id="tab-business" onclick="fetchNews('business')">Business</div>
        <div class="news-tab ${currentNewsCategory === 'sports' ? 'active' : ''}" id="tab-sports" onclick="fetchNews('sports')">Sports</div>
        <div class="news-tab ${currentNewsCategory === 'global' ? 'active' : ''}" id="tab-global" onclick="fetchNews('global')">Global (Al Jazeera)</div>
    `;

    let customSources = JSON.parse(localStorage.getItem('dashboardCustomRssSources')) || [];
    customSources.forEach(src => {
        html += `<div class="news-tab ${currentNewsCategory === src.id ? 'active' : ''}" id="tab-${src.id}" onclick="fetchNews('${src.id}')">${escapeHtml(src.name)}</div>`;
    });

    container.innerHTML = html;
}

async function fetchNews(category, forceRefresh = false) {
    currentNewsCategory = category;
    renderNewsTabs();

    const c = document.getElementById('news-container');
    if(!c) return;

    const cacheKey = `news_cache_${category}`;

    if (!forceRefresh) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 15 * 60 * 1000) { renderNewsItems(parsed.items, c); return; }
        }
    }

    c.innerHTML = '<div class="loading">Fetching latest headlines from Google Proxy...</div>';
    triggerMasonryUpdate();

    try {
        const items = await fetchNewsData(category, forceRefresh);
        if (items.length === 0) throw new Error("No items");
        sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), items: items }));
        renderNewsItems(items, c);
    } catch(e) {
        c.innerHTML = "<div class='loading' style='color:var(--danger);'>Connection timeout. Click the refresh button to try again.</div>";
        triggerMasonryUpdate();
    }
}

window.addEventListener('load', initDashboard);

// --- PWA SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        if (window.location.protocol !== 'file:') {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('App ready for offline use.'))
                .catch(err => console.log('Service Worker failed:', err));
        }
    });
}

const SOUND_CLACK = 'data:audio/wav;base64,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';
const SOUND_BLOOP = 'data:audio/wav;base64,UklGRpgiAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXQiAABmJl8mWCZSJksmRCY+JjcmMCYqJiMmHCYWJg8mCCYCJvsl9SXuJecl4SXaJdQlzSXGJcAluSWzJawlpiWfJZglkiWLJYUlfiV4JXElayVkJV4lVyVRJUolRCU9JTclMCUqJSMlHSUWJRAlCSUDJQPbCtsQ2xfbHdsk2yrbMNs32z3bRNtK21DbV9td22Tbattw23fbfduD24rbkNuW253bo9up27Dbttu828PbydvP29bb3Nvi2+jb79v12/vbAtwI3A7cFNwb3CHcJ9wt3DTcOtxA3EbcTdytI6cjoSObI5QjjiOII4IjfCN2I28jaSNjI10jVyNRI0ojRCM+IzgjMiMsIyYjHyMZIxMjDSMHIwEj+yL1Iu8i6SLjItwi1iLQIsoixCK+IrgisiKsIqYioCKaIpQijiKIIoIifCJ2IpDdlt2c3aLdqN2u3bTdut3A3cbdzN3S3djd3t3k3erd8N323fvdAd4H3g3eE94Z3h/eJd4r3jHeN9483kLeSN5O3lTeWt5g3mXea95x3nfefd6D3onejt6U3preoN6m3qvesd633kMhPSE4ITIhLCEmISEhGyEVIQ8hCSEEIf4g+CDyIO0g5yDhINwg1iDQIMogxSC/ILkgtCCuIKggoyCdIJcgkSCMIIYggSB7IHUgcCBqIGQgXyBZIFMgTiBIIEIgPSA3IDIgLCDa39/f5d/q3/Df9t/73wHgBuAM4BHgF+Ac4CLgKOAt4DPgOOA+4EPgSeBO4FTgWeBf4GTgauBv4HXgeuCA4IXgi+CQ4Jbgm+Ch4KbgrOCx4LfgvODB4MfgzODS4Nfg3eDi4BkfEx8OHwgfAx/+Hvge8x7tHuge4x7dHtge0h7NHsgewh69Hrgesh6tHqgeoh6dHpgekh6NHogegh59Hngech5tHmgeYx5dHlgeUx5NHkgeQx4+HjgeMx4uHikeIx7i4efh7OHy4ffh/OEB4gfiDOIR4hbiG+Ih4ibiK+Iw4jXiO+JA4kXiSuJP4lTiWuJf4mTiaeJu4nPieeJ+4oPiiOKN4pLil+Kc4qLip+Ks4rHituK74sDixeLK4s/iKx0mHSEdHB0XHRIdDR0IHQMd/hz5HPQc7xzqHOUc4BzbHNYc0RzMHMccwhy9HLgc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bwhtCGwIaghpCJj3mveb9533nveg96H3o/ek96b3p/ep96r3q/et9673sPex97P3tPe297f3uPe697v3vfe+90AIPwg9CDwIOwg5CDgINgg1CDMIMggxCC8ILggsCCsIKQgoCCcIJQgkCCIIIQggCB4IHQgbCOb36Pfp9+r37Pft9+/38Pfx9/P39Pf29/f3+Pf69/v3/ff+9//3AfgC+AT4BfgG+Aj4CfgK+PQH8wfxB/AH7wftB+wH6gfpB+gH5gflB+QH4gfhB98H3gfdB9sH2gfZB9cH1gfVB9MH0gfQBzH4Mvg0+DX4Nvg4+Dn4Ovg8+D34PvhA+EH4Q/hE+EX4R/hI+En4S/hM+E34T/hQ+FH4U/hU+KsHqQeoB6cHpQekB6MHoQegB58HnQecB5sHmQeYB5cHlQeUB5MHkQeQB48HjgeMB4sHigd4+Hn4evh8+H34fviA+IH4gviE+IX4hviH+In4iviL+I34jviP+JH4kviT+JT4lviX+Jj4mvhlB2QHYwdhB2AHXwddB1wHWwdaB1gHVwdWB1QHUwdSB1EHTwdOB00HTAdKB0kHSAdGB0UHvPi9+L/4wPjB+ML4xPjF+Mb4x/jJ+Mr4y/jM+M74z/jQ+NH40/jU+NX41vjY+Nn42vjb+CMHIgchByAHHgcdBxwHGwcZBxgHFwcWBxQHEwcSBxEHEAcOBw0HDAcLBwkHCAcHBwYHBQf9+P74//gA+QL5A/kE+QX5BvkI+Qn5CvkL+Q35DvkP+RD5EfkT+RT5FfkW+Rf5Gfka+Rv55AbjBuEG4AbfBt4G3QbbBtoG2QbYBtcG1QbUBtMG0gbRBtAGzgbNBswGywbKBsgGxwY6+Tv5PPk9+T/5QPlB+UL5Q/lF+Ub5R/lI+Un5SvlM+U35TvlP+VD5UflT+VT5VflW+Vf5qAamBqUGpAajBqIGoQagBp4GnQacBpsGmgaZBpcGlgaVBpQGkwaSBpEGjwaOBo0GjAZ1+Xb5d/l4+Xr5e/l8+X35fvl/+YD5gvmD+YT5hfmG+Yf5iPmJ+Yv5jPmN+Y75j/mQ+W8GbgZsBmsGagZpBmgGZwZmBmUGYwZiBmEGYAZfBl4GXQZcBlsGWgZYBlcGVgZVBlQGUwau+a/5sPmy+bP5tPm1+bb5t/m4+bn5uvm7+bz5vvm/+cD5wfnC+cP5xPnF+cb5x/k4BjYG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hv2G/Yf9h/14AngCeAJ3AncCdgJ2AnUCdQJ1AnQCdAJzAnMCcgJyAnICcQJxAnACkP2R/ZH9kf2S/ZL9k/2T/ZT9lP2U/ZX9lf2W/Zb9lv2X/Zf9mP1oAmcCZwJnAmYCZgJlAmUCZQJkAmQCYwJjAmICYgJiAmECYQJgAqD9oP2h/aH9ov2i/aP9o/2j/aT9pP2l/aX9pf2m/ab9p/2n/af9qP1YAlcCVwJWAlYCVgJVAlUCVAJUAlQCUwJTAlICUgJSAlECUQJQArD9sP2x/bH9sv2y/bL9s/2z/bT9tP20/bX9tf22/bb9tv23/bf9SAJIAkgCRwJHAkYCRgJGAkUCRQJEAkQCRAJDAkMCQgJCAkICQQK//cD9wP3A/cH9wf3B/cL9wv3D/cP9w/3E/cT9xf3F/cX9xv3G/TkCOQI5AjgCOAI4AjcCNwI2AjYCNgI1AjUCNAI0AjQCMwIzAjMCzv3O/c/9z/3P/dD90P3R/dH90f3S/dL90v3T/dP91P3U/dT91f0rAisCKgIqAikCKQIpAigCKAIoAicCJwImAiYCJgIlAiUCJQIkAtz93f3d/d393v3e/d793/3f/eD94P3g/eH94f3h/eL94v3j/eP9HQIcAhwCHAIbAhsCGwIaAhoCGQIZAhkCGAIYAhgCFwIXAhcCFgLq/ev96/3r/ez97P3s/e397f3t/e797v3v/e/97/3w/fD98P0PAg8CDwIOAg4CDgINAg0CDAIMAgwCCwILAgsCCgIKAgoCCQIJAvf9+P34/fn9+f35/fr9+v36/fv9+/37/fz9/P38/f39/f39/f79AgIBAgECAQIAAgACAAL/Af8B/wH+Af4B/gH9Af0B/QH8AfwBBP4F/gX+Bf4G/gb+Bv4H/gf+CP4I/gj+Cf4J/gn+Cv4K/gr+C/71AfUB9AH0AfQB8wHzAfMB8gHyAfIB8QHxAfEB8AHwAfAB7wER/hH+Ev4S/hL+E/4T/hP+FP4U/hT+Ff4V/hX+Fv4W/hb+F/4=';

// --- AUDIO SOUNDSCAPE ---
const audioCache = {
    clack: new Audio(SOUND_CLACK),
    bloop: new Audio(SOUND_BLOOP)
};

function playThemeSound() {
    if (dashSettings.themeStyle === 'terminal') {
        audioCache.clack.currentTime = 0;
        audioCache.clack.play().catch(() => {});
    } else if (dashSettings.themeStyle === 'pixel') {
        audioCache.bloop.currentTime = 0;
        audioCache.bloop.play().catch(() => {});
    }
}

document.addEventListener('click', function(e) {
    const isInteractive = e.target.closest('button, .btn, a, input, select, .card, .news-item, .fab-btn, .action-btn, .icon-btn');
    if (isInteractive) {
        playThemeSound();
    }
});

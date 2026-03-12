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
}

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

function exportData() {
    const data = {
        todos: localStorage.getItem('dashboardTodos'), 
        bookmarks: localStorage.getItem('dashboardBookmarks'),
        notes: localStorage.getItem('dashboardNotes'), 
        layout: localStorage.getItem('dashboardLayout'),
        settings: localStorage.getItem('dashSettings'), 
        theme: localStorage.getItem('dashboardTheme'),
        holiday: localStorage.getItem('holidayState'), 
        weather: localStorage.getItem('weatherCardState'),
        tornConfig: localStorage.getItem('dashboardTornTracker'),
        bankApps: localStorage.getItem('dashboardBankApps')
    };
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
            if(data.todos) localStorage.setItem('dashboardTodos', data.todos);
            if(data.bookmarks) localStorage.setItem('dashboardBookmarks', data.bookmarks);
            if(data.notes) localStorage.setItem('dashboardNotes', data.notes);
            if(data.layout) localStorage.setItem('dashboardLayout', data.layout);
            if(data.settings) localStorage.setItem('dashSettings', data.settings);
            if(data.theme) localStorage.setItem('dashboardTheme', data.theme);
            if(data.holiday) localStorage.setItem('holidayState', data.holiday);
            if(data.weather) localStorage.setItem('weatherCardState', data.weather);
            if(data.tornConfig) localStorage.setItem('dashboardTornTracker', data.tornConfig);
            if(data.bankApps) localStorage.setItem('dashboardBankApps', data.bankApps);
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
        const response = await fetch(`https://api.torn.com/user/?selections=bars,profile,cooldowns,money&key=${tornConfig.key}`);
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
        tornTimers = {
            enFull: now + data.energy.fulltime * 1000,
            neFull: now + data.nerve.fulltime * 1000,
            haFull: now + data.happy.fulltime * 1000,
            liFull: now + data.life.fulltime * 1000,
            medCd: now + data.cooldowns.medical * 1000,
            drugCd: now + data.cooldowns.drug * 1000,
            booCd: now + data.cooldowns.booster * 1000
        };

        updateTornTimersUI();
        triggerMasonryUpdate();
        
    } catch (e) {
        console.error("Failed to fetch Torn data", e);
    }
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

    const fmtFull = (target) => {
        let s = Math.floor((target - now) / 1000);
        if(s <= 0) return '';
        let h = Math.floor(s / 3600);
        let m = Math.floor((s % 3600) / 60);
        let sec = s % 60;
        if (h > 0) return `(Full in ${h}h ${m}m)`;
        if (m > 0) return `(Full in ${m}m ${sec}s)`;
        return `(Full in ${sec}s)`;
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
        el.innerText = `${h}:${m}:${sec}`;
        el.style.color = 'var(--danger)'; 
    };

    const en = document.getElementById('torn-en-full'); if(en) en.innerText = fmtFull(tornTimers.enFull);
    const ne = document.getElementById('torn-ne-full'); if(ne) ne.innerText = fmtFull(tornTimers.neFull);
    const ha = document.getElementById('torn-ha-full'); if(ha) ha.innerText = fmtFull(tornTimers.haFull);
    const li = document.getElementById('torn-li-full'); if(li) li.innerText = fmtFull(tornTimers.liFull);

    fmtCd(tornTimers.medCd, 'torn-cd-med');
    fmtCd(tornTimers.drugCd, 'torn-cd-drug');
    fmtCd(tornTimers.booCd, 'torn-cd-boo');
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
    
    currentList.forEach((t, i) => { 
        list.innerHTML += `
        <li class="todo-item ${t.completed ? 'completed' : ''}" draggable="true" ondragstart="handleSubDragStart(event, 'task')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'task', todos['${activeTaskTab}'], saveTodos, renderTodos)" ondragend="handleSubDragEnd(event)">
            <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></div>
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTodo(${i})">
            <span class="todo-text" onclick="toggleTodo(${i})">${escapeHtml(t.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${i})" title="Delete task">&times;</button>
        </li>`; 
    });
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

function getWeatherDetails(code, isDay = 1) {
    if (code === 0) return { desc: 'Clear', icon: isDay ? '<i class="ph-fill ph-sun" style="color: #fbbc04;"></i>' : '<i class="ph-fill ph-moon" style="color: #a1a1a6;"></i>' };
    if ([1,2].includes(code)) return { desc: 'Cloudy', icon: isDay ? '<i class="ph-fill ph-cloud-sun" style="color: #fbbc04;"></i>' : '<i class="ph-fill ph-cloud-moon" style="color: #a1a1a6;"></i>' };
    if (code === 3) return { desc: 'Overcast', icon: '<i class="ph-fill ph-cloud" style="color: #a1a1a6;"></i>' };
    if ([45, 48].includes(code)) return { desc: 'Fog', icon: '<i class="ph-fill ph-cloud-fog" style="color: #a1a1a6;"></i>' };
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { desc: 'Rain', icon: '<i class="ph-fill ph-cloud-rain" style="color: #4285F4;"></i>' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { desc: 'Snow', icon: '<i class="ph-fill ph-cloud-snow" style="color: #8ec5fc;"></i>' };
    if ([95, 96, 99].includes(code)) return { desc: 'Storm', icon: '<i class="ph-fill ph-cloud-lightning" style="color: #ff9500;"></i>' };
    return { desc: 'Unknown', icon: '<i class="ph-fill ph-sun"></i>' };
}
function getWindDir(d) { return ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8]; }

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
        const cur = data.current, day = data.daily, hr = data.hourly;
        const wInfo = getWeatherDetails(cur.weather_code, cur.is_day);
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
                <div class="sun-cycle" style="width: 100%; box-sizing: border-box;">
                    <span><i class="ph-fill ph-sunrise" style="color: #fbbc04; font-size: 1.1rem;"></i> <span style="color:var(--text-main)">${new Date(day.sunrise[0]).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></span>
                    <span><i class="ph-fill ph-sunset" style="color: #ff9500; font-size: 1.1rem;"></i> <span style="color:var(--text-main)">${new Date(day.sunset[0]).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></span>
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
    list.innerHTML = '';
    const now = new Date(); now.setHours(0,0,0,0);
    const up = holidaysData.filter(h => new Date(h.date) >= now);
    if (up.length === 0) { list.innerHTML = '<li class="holiday-item">No more holidays mapped for this year.</li>'; return; }
    up.slice(0, 5).forEach(h => {
        const diffDays = Math.ceil(Math.abs(new Date(h.date) - now) / 86400000);
        list.innerHTML += `<li class="holiday-item"><span class="holiday-name">${escapeHtml(h.name)}</span><div class="holiday-meta"><span class="holiday-countdown">${diffDays === 0 ? "Today" : `in ${diffDays}d`}</span><span class="holiday-date">${new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div></li>`;
    });
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
    grid.innerHTML = '';
    if (shortcutsArr.length === 0) { grid.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">No links added yet.</div>'; triggerMasonryUpdate(); return; }
    shortcutsArr.forEach((sc, i) => {
        let domain = sc.path.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        let favUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        let onErrorFallback = `this.outerHTML='<i class=\\'ph-fill ph-globe shortcut-fallback-icon\\'></i>'`;
        grid.innerHTML += `
            <div class="shortcut-item" draggable="true" ondragstart="handleSubDragStart(event, 'link')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'link', shortcutsArr, saveShortcuts, renderShortcuts)" ondragend="handleSubDragEnd(event)">
                <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical"></i></div>
                <a href="${sc.path}" target="_blank" style="display:flex; align-items:center; gap:8px; flex-grow:1; text-decoration:none; color:inherit;">
                    <div class="shortcut-icon-wrapper"><img src="${favUrl}" alt="" onerror="${onErrorFallback}"></div>
                    <div class="shortcut-info"><span class="shortcut-name" title="${escapeHtml(sc.name)}">${escapeHtml(sc.name)}</span></div>
                </a>
                <button class="delete-btn" onclick="deleteShortcut(${i}, event)" title="Remove Link">&times;</button>
            </div>`;
    });
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
    
    const searchQ = searchEl.value.toLowerCase(); list.innerHTML = '';
    let filteredNotes = searchQ ? notesArr.filter(n => n.title.toLowerCase().includes(searchQ) || n.content.toLowerCase().includes(searchQ)) : notesArr;
    if (filteredNotes.length === 0) { list.innerHTML = `<div class="loading">${searchQ ? 'No matches found.' : 'No notes yet. Click + to create.'}</div>`; triggerMasonryUpdate(); return; }

    [...filteredNotes].sort((a, b) => { if(a.pinned === b.pinned) return b.lastEdited - a.lastEdited; return a.pinned ? -1 : 1; }).forEach(note => {
        const diffMins = Math.floor((Date.now() - note.lastEdited) / 60000);
        let dateStr = diffMins < 1 ? "Just now" : diffMins < 60 ? `${diffMins}m` : diffMins < 1440 ? `${Math.floor(diffMins/60)}h` : new Date(note.lastEdited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const pinClass = note.pinned ? 'pinned' : ''; const pinIcon = note.pinned ? 'ph-fill ph-push-pin' : 'ph ph-push-pin';
        
        list.innerHTML += `
            <div class="note-item color-${note.color} ${pinClass}" onclick="openNote(${note.id})">
                <div class="note-item-content">
                    <div class="note-title">${escapeHtml(note.title.trim() || "Untitled")}</div>
                    <div class="note-excerpt">${escapeHtml(note.content.trim().substring(0, 40)) || "..."}</div>
                </div>
                <div class="note-actions-col">
                    <button class="pin-btn" onclick="togglePin(${note.id}, event)" title="Pin Note"><i class="${pinIcon}"></i></button>
                    <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">${dateStr}</span>
                </div>
                <button class="note-delete-btn" onclick="deleteNote(${note.id}, event)" title="Delete">&times;</button>
            </div>`;
    });
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

async function fetchNews(category, forceRefresh = false) {
    currentNewsCategory = category;
    document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
    const t = document.getElementById(`tab-${category}`);
    if(t) t.classList.add('active');

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
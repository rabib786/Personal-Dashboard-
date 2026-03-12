const { performance } = require('perf_hooks');

// Mock data
const hr = {
    time: Array(24).fill(0).map((_, i) => new Date(Date.now() + i*3600000).toISOString()),
    weather_code: Array(24).fill(1),
    temperature_2m: Array(24).fill(25),
    precipitation_probability: Array(24).fill(10)
};

const day = {
    time: Array(7).fill(0).map((_, i) => new Date(Date.now() + i*86400000).toISOString()),
    weather_code: Array(7).fill(1),
    temperature_2m_max: Array(7).fill(30),
    temperature_2m_min: Array(7).fill(20),
    precipitation_probability_max: Array(7).fill(20)
};

function getWeatherDetails(code, isDay) {
    return { icon: 'icon' };
}

function testConcat() {
    let html = `<div style="width: 100%;"><div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text-muted);">Hourly</div><div class="hourly-forecast">`;
    let hIdx = 0;
    for(let i=hIdx+1; i<=hIdx+6; i++) {
        if(!hr.time[i]) break;
        html += `<div class="hourly-item"><span class="hourly-time">${new Date(hr.time[i]).toLocaleTimeString('en-US',{hour:'numeric'})}</span><span class="hourly-icon">${getWeatherDetails(hr.weather_code[i], 1).icon}</span><span class="hourly-temp">${Math.round(hr.temperature_2m[i])}&deg;</span>${hr.precipitation_probability[i]>0 ? `<div class="hourly-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${hr.precipitation_probability[i]}%</div>`:''}</div>`;
    }
    html += `</div></div><div class="forecast-container" style="width: 100%;">`;
    for (let i=1; i<=4; i++) {
        html += `<div class="forecast-day"><span class="fc-name">${new Date(day.time[i]).toLocaleDateString('en-US',{weekday:'short'})}</span><span class="fc-icon">${getWeatherDetails(day.weather_code[i], 1).icon}</span><div class="fc-temps"><span class="fc-max">${Math.round(day.temperature_2m_max[i])}&deg;</span><span class="fc-min">${Math.round(day.temperature_2m_min[i])}&deg;</span></div>${day.precipitation_probability_max[i]>0 ? `<div class="fc-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${day.precipitation_probability_max[i]}%</div>`:''}</div>`;
    }
    html += `</div></div>`;
    return html;
}

function testArrayJoin() {
    let hIdx = 0;
    const items = [];
    for(let i=hIdx+1; i<=hIdx+6; i++) {
        if(!hr.time[i]) break;
        items.push(`<div class="hourly-item"><span class="hourly-time">${new Date(hr.time[i]).toLocaleTimeString('en-US',{hour:'numeric'})}</span><span class="hourly-icon">${getWeatherDetails(hr.weather_code[i], 1).icon}</span><span class="hourly-temp">${Math.round(hr.temperature_2m[i])}&deg;</span>${hr.precipitation_probability[i]>0 ? `<div class="hourly-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${hr.precipitation_probability[i]}%</div>`:''}</div>`);
    }

    const dailyItems = [];
    for (let i=1; i<=4; i++) {
        dailyItems.push(`<div class="forecast-day"><span class="fc-name">${new Date(day.time[i]).toLocaleDateString('en-US',{weekday:'short'})}</span><span class="fc-icon">${getWeatherDetails(day.weather_code[i], 1).icon}</span><div class="fc-temps"><span class="fc-max">${Math.round(day.temperature_2m_max[i])}&deg;</span><span class="fc-min">${Math.round(day.temperature_2m_min[i])}&deg;</span></div>${day.precipitation_probability_max[i]>0 ? `<div class="fc-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${day.precipitation_probability_max[i]}%</div>`:''}</div>`);
    }

    return `<div style="width: 100%;"><div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text-muted);">Hourly</div><div class="hourly-forecast">` +
           items.join('') +
           `</div></div><div class="forecast-container" style="width: 100%;">` +
           dailyItems.join('') +
           `</div></div>`;
}


function testArrayJoin3() {
    let hIdx = 0;
    let html = `<div style="width: 100%;"><div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text-muted);">Hourly</div><div class="hourly-forecast">`;
    const items = [];
    for(let i=hIdx+1; i<=hIdx+6; i++) {
        if(!hr.time[i]) break;
        items.push(`<div class="hourly-item"><span class="hourly-time">${new Date(hr.time[i]).toLocaleTimeString('en-US',{hour:'numeric'})}</span><span class="hourly-icon">${getWeatherDetails(hr.weather_code[i], 1).icon}</span><span class="hourly-temp">${Math.round(hr.temperature_2m[i])}&deg;</span>${hr.precipitation_probability[i]>0 ? `<div class="hourly-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${hr.precipitation_probability[i]}%</div>`:''}</div>`);
    }
    html += items.join('');
    html += `</div></div><div class="forecast-container" style="width: 100%;">`;

    const dailyItems = [];
    for (let i=1; i<=4; i++) {
        dailyItems.push(`<div class="forecast-day"><span class="fc-name">${new Date(day.time[i]).toLocaleDateString('en-US',{weekday:'short'})}</span><span class="fc-icon">${getWeatherDetails(day.weather_code[i], 1).icon}</span><div class="fc-temps"><span class="fc-max">${Math.round(day.temperature_2m_max[i])}&deg;</span><span class="fc-min">${Math.round(day.temperature_2m_min[i])}&deg;</span></div>${day.precipitation_probability_max[i]>0 ? `<div class="fc-pop"><i class="ph-fill ph-drop" style="color: var(--accent);"></i> ${day.precipitation_probability_max[i]}%</div>`:''}</div>`);
    }
    html += dailyItems.join('');
    html += `</div></div>`;
    return html;
}

// Warmup
for(let i=0; i<1000; i++) {
    testConcat();
    testArrayJoin();
    testArrayJoin3();
}

const ITERATIONS = 10000;

let start = performance.now();
for(let i = 0; i < ITERATIONS; i++) {
    testConcat();
}
let concatTime = performance.now() - start;

start = performance.now();
for(let i = 0; i < ITERATIONS; i++) {
    testArrayJoin();
}
let arrayJoinTime = performance.now() - start;


start = performance.now();
for(let i = 0; i < ITERATIONS; i++) {
    testArrayJoin3();
}
let arrayJoinTime3 = performance.now() - start;

console.log(`String concatenation: ${concatTime.toFixed(2)} ms`);
console.log(`Array push join: ${arrayJoinTime.toFixed(2)} ms`);
console.log(`Array push join 3: ${arrayJoinTime3.toFixed(2)} ms`);

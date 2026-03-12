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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adjustColorHover };
}

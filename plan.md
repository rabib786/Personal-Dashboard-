# Plan

1. **Update Root Variables**:
   In `style.css`, add the following inside `:root`:
   ```css
   --transition-speed: 0.4s;
   --transition-curve: ease;
   --font-weight-icon: 300; /* Default Phosphor icons usually look best between 300-400 */
   ```

2. **Update Theme Overrides**:
   - In `[data-theme-style="cyberpunk"]`, add:
     ```css
     --transition-speed: 0.2s; /* Snappier for cyberpunk */
     --transition-curve: ease-out;
     --font-weight-icon: 700;
     ```
   - In `[data-theme-style="terminal"]`, add:
     ```css
     --transition-speed: 0s;
     --transition-curve: linear;
     --font-weight-icon: 400; /* Regular or light for terminal */
     ```
   - In `[data-theme-style="pixel"]`, add:
     ```css
     --transition-speed: 0s;
     --transition-curve: linear;
     --font-weight-icon: 900; /* Chunky for pixel */
     ```

3. **Apply Font Weight to Icons**:
   - Add a rule targeting `.ph` or `i` to use `--font-weight-icon` so icons shift dynamically. Let's look at `index.html` to see if they use `ph` class. Yes: `<i id="theme-icon" class="ph ph-moon"></i>`.
   - Add `i[class^="ph"] { font-weight: var(--font-weight-icon); }` in `style.css`. Actually, phosphor uses font-weight or weights based on classes (`ph-bold`, `ph-fill` etc). But their core font uses font-weight as a variable or CSS property if it's the webfonts version. I will apply `font-weight: var(--font-weight-icon);` to `i` tags.

4. **Refactor Transitions**:
   Find all `.card` and button classes, and update their `transition` rules to use `--transition-speed` and `--transition-curve` instead of hardcoded `0.3s ease`, `0.2s`, etc.
   Classes to update include (but not limited to):
   - `.fab-btn`
   - `.modal-close`
   - `.bg-btn`
   - `.btn-primary`
   - `.btn-secondary`
   - `.backup-btn`
   - `.card`
   - `.icon-btn`
   - `.action-btn`
   - `.app-tile`
   - `.bank-del-btn`
   - `.calendar-nav-btn`
   - `.calendar-today-btn`
   - `.btn-add`
   - `.btn-clean`
   - `.delete-btn`
   - `.shortcut-item`
   - `.note-item`
   - `.pin-btn`
   - `.color-dot`
   - `.news-tab`
   - `.news-item`

   Also, check `transition: all 0.2s;` etc and change to `transition: all var(--transition-speed) var(--transition-curve);`. We want to make sure the hover states transition nicely based on the theme.

5. **Pre commit step**: Include a pre commit step to test verifications, reviews, and reflections.

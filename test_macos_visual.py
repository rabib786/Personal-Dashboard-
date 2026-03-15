from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:8000")

        # Enable macOS theme
        page.evaluate("""() => {
            const settings = JSON.parse(localStorage.getItem('dashSettings') || '{}');
            settings.osThemeEnabled = true;
            settings.osTheme = 'macos';
            localStorage.setItem('dashSettings', JSON.stringify(settings));
        }""")

        page.reload()
        page.wait_for_timeout(2000)

        # Output info about the injected controls
        controls = page.evaluate("""() => {
            const controls = document.querySelectorAll('.macos-window-controls');
            return Array.from(controls).map(c => {
                const rect = c.getBoundingClientRect();
                const style = window.getComputedStyle(c);
                return {
                    parent: c.parentElement.parentElement.id,
                    display: style.display,
                    visibility: style.visibility,
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                    html: c.outerHTML
                };
            });
        }""")

        print("macOS controls injected:")
        for c in controls:
            print(f"- in {c['parent']}: display={c['display']}, rect={c['width']}x{c['height']} at ({c['left']}, {c['top']})")

        browser.close()

if __name__ == "__main__":
    run()

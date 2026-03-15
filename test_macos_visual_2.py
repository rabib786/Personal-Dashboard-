from playwright.sync_api import sync_playwright

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

        controls = page.evaluate("""() => {
            const c = document.querySelector('.macos-window-controls');
            if (!c) return null;

            const header = c.parentElement;
            return {
                parent: header.parentElement.id,
                headerPosition: window.getComputedStyle(header).position,
                controlsPosition: window.getComputedStyle(c).position,
                headerHtml: header.outerHTML
            };
        }""")

        import json
        print(json.dumps(controls, indent=2))

        browser.close()

if __name__ == "__main__":
    run()

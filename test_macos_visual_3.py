from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
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

        # Click max button of task
        page.evaluate("""() => {
            document.querySelector('#mod-tasks .macos-max').click();
        }""")

        page.wait_for_timeout(1000)

        page.screenshot(path="dashboard_macos_maximized.png")

        browser.close()

if __name__ == "__main__":
    run()

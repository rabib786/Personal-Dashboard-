from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Switch to macos theme
        page.evaluate("""() => {
            dashSettings.osThemeEnabled = true;
            dashSettings.osTheme = 'macos';
            localStorage.setItem('dashSettings', JSON.stringify(dashSettings));
            location.reload();
        }""")

        page.wait_for_selector(".macos-window-controls")

        # Wait a bit for layout to settle
        page.wait_for_timeout(1000)

        page.screenshot(path="/app/verification/dashboard_macos_verified.png", full_page=True)
        print("Screenshot saved to /app/verification/dashboard_macos_verified.png")
        browser.close()

if __name__ == "__main__":
    run()

from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto("http://localhost:8000")
        page.wait_for_timeout(2000)
        page.screenshot(path="dashboard_full.png")
        browser.close()

if __name__ == "__main__":
    run()

from playwright.sync_api import sync_playwright

def test_get_theme_icon_weight():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context that blocks external slow resources for this test
        context = browser.new_context()
        context.route("**/*", lambda route: route.abort()
                      if any(x in route.request.url for x in ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com"])
                      else route.continue_())

        page = context.new_page()

        print("Navigating to http://localhost:8000")
        try:
            page.goto("http://localhost:8000", wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"Navigation error or timeout (expected if blocking some resources): {e}")

        # Wait for the page to load and dashSettings to be initialized
        print("Waiting for dashSettings and getThemeIconWeight...")
        try:
            page.wait_for_function("typeof dashSettings !== 'undefined' && typeof getThemeIconWeight === 'function'", timeout=10000)
        except Exception as e:
            print(f"Failed to find dashSettings or getThemeIconWeight: {e}")
            raise

        test_cases = [
            ("glass", "ph-thin"),
            ("brutalism", "ph-bold"),
            ("terminal", "ph-bold"),
            ("pixel", "ph-bold"),
            ("material", "ph-fill"),
            ("cyberpunk", "ph-light"),
            ("e-ink", "ph-bold"),
            ("unknown", "ph-regular"), # Default case
        ]

        success = True
        for theme, expected in test_cases:
            result = page.evaluate(f"""
                dashSettings.themeStyle = '{theme}';
                getThemeIconWeight();
            """)
            print(f"Testing theme: {theme} | Expected: {expected} | Result: {result}")
            if result != expected:
                print(f"ASSERTION FAILED for theme {theme}: expected {expected}, got {result}")
                success = False

        browser.close()
        if not success:
            raise AssertionError("One or more test cases for getThemeIconWeight failed.")

        print("All test cases for getThemeIconWeight passed!")

if __name__ == "__main__":
    try:
        test_get_theme_icon_weight()
    except Exception as e:
        print(f"Test failed: {e}")
        exit(1)

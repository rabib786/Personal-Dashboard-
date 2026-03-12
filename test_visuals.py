import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Wait for initial load
        page.wait_for_timeout(2000)

        # Function to mock weather data
        mock_weather_js = """
        window.mockWeather = async function(code, isDay) {
            // Mock open-meteo weather API responses
            const wRes = {
                current: {
                    temperature_2m: 25,
                    relative_humidity_2m: 60,
                    apparent_temperature: 26,
                    is_day: isDay,
                    weather_code: code,
                    wind_speed_10m: 10,
                    wind_direction_10m: 180,
                    surface_pressure: 1012,
                    visibility: 10000
                },
                hourly: {
                    time: [],
                    temperature_2m: [],
                    weather_code: [],
                    precipitation_probability: []
                },
                daily: {
                    time: [],
                    weather_code: [],
                    temperature_2m_max: [],
                    temperature_2m_min: [],
                    sunrise: [],
                    sunset: [],
                    uv_index_max: [],
                    precipitation_probability_max: []
                }
            };
            const aRes = { current: { us_aqi: 20 } };

            const wInfo = getWeatherDetails(wRes.current.weather_code, wRes.current.is_day);

            // Apply dynamic weather background
            const modWeather = document.getElementById('mod-weather');
            if (modWeather) {
                // Remove existing weather background classes
                modWeather.className = modWeather.className.replace(/\\bweather-bg-\\S+/g, '');
                modWeather.classList.add(wInfo.bgClass);

                // Handle animated overlay
                let overlay = modWeather.querySelector('.weather-fx-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'weather-fx-overlay';
                    modWeather.insertBefore(overlay, modWeather.firstChild);
                }
                overlay.className = 'weather-fx-overlay'; // Reset overlay classes
                if (wInfo.animClass) {
                    overlay.classList.add(wInfo.animClass);
                }
            }
        }
        """

        # Weather codes to test
        scenarios = [
            {"code": 0, "isDay": 1, "name": "clear_day"},
            {"code": 0, "isDay": 0, "name": "clear_night"},
            {"code": 61, "isDay": 1, "name": "rain"},
            {"code": 71, "isDay": 1, "name": "snow"},
            {"code": 45, "isDay": 1, "name": "fog"},
            {"code": 95, "isDay": 1, "name": "storm"}
        ]

        # Hide other modules to focus on weather card layout for screenshotting
        page.evaluate("""
            document.querySelectorAll('.card:not(#mod-weather)').forEach(el => el.style.display = 'none');
            document.body.style.padding = '20px';
        """)

        # Inject the mock function
        page.evaluate(mock_weather_js)

        for s in scenarios:
            page.evaluate(f"mockWeather({s['code']}, {s['isDay']});")
            page.wait_for_timeout(500)  # Wait for transition/animation
            mod_weather = page.locator("#mod-weather")
            mod_weather.screenshot(path=f"weather_{s['name']}.png")
            print(f"Captured weather_{s['name']}.png")

        browser.close()

if __name__ == "__main__":
    run()
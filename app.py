import os
import time
import traceback
import threading
import requests
from flask import Flask, request, jsonify, render_template
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager

app = Flask(__name__)

# Global driver instance and lock for thread safety
driver = None
driver_lock = threading.Lock()

def download_ublock_extension():
    extension_path = './ublock_origin.xpi'
    if os.path.exists(extension_path):
        print(f"uBlock Origin already exists at: {extension_path}")
        return extension_path

    url = "https://addons.mozilla.org/firefox/downloads/file/4359936/ublock_origin-1.60.0.xpi"
    response = requests.get(url)
    response.raise_for_status()

    with open(extension_path, 'wb') as file:
        file.write(response.content)
    print(f"Downloaded uBlock Origin to: {extension_path}")
    return extension_path

def init_driver():
    """Initialize the global Firefox WebDriver with uBlock Origin installed."""
    global driver
    options = webdriver.FirefoxOptions()
    options.add_argument("--headless")
    options.add_argument("--width=1920")
    options.add_argument("--height=1080")
    service = FirefoxService(GeckoDriverManager().install())
    driver = webdriver.Firefox(service=service, options=options)

    # Install uBlock Origin only once at startup.
    ublock_extension_path = download_ublock_extension()
    driver.install_addon(ublock_extension_path, temporary=True)
    print("Driver initialized with uBlock Origin.")

def extract_iframe(url):
    """
    Navigates to the given URL using the global driver and:
      1. If a link with the text "Launch Interactive" exists, clicks it (or navigates to its destination).
      2. Searches for the first iframe whose src contains 'PhysicsClassroom'.
    Returns the iframe src if found, otherwise None.
    """
    global driver
    with driver_lock:
        # Navigate to the initial URL
        driver.get(url)
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

        # Look for a link with text "Launch Interactive"
        try:
            launch_link = WebDriverWait(driver, 3).until(
                EC.element_to_be_clickable((By.LINK_TEXT, "Launch Interactive"))
            )
            if launch_link:
                # Click the link and wait for navigation
                launch_link.click()
                WebDriverWait(driver, 10).until(
                    lambda d: d.execute_script("return document.readyState") == "complete"
                )
                print("Navigated to Launch Interactive page.")
        except Exception as e:
            # Link not found; continue on the current page
            print("No 'Launch Interactive' link found, proceeding with extraction.")

        # Now search for the iframe
        start_time = time.time()
        max_wait_time = 10  # seconds
        found_src = None

        while time.time() - start_time < max_wait_time:
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            for iframe in iframes:
                src = iframe.get_attribute("src")
                if src and "PhysicsClassroom" in src:
                    found_src = src
                    break
            if found_src:
                break
            time.sleep(0.2)
        return found_src

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/extract", methods=["POST"])
def extract():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "No URL provided."}), 400

    url = data["url"]
    try:
        iframe_src = extract_iframe(url)
        if iframe_src:
            return jsonify({"iframe_src": iframe_src})
        else:
            return jsonify({"error": "No target iframe found."}), 404
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An error occurred during extraction."}), 500

if __name__ == "__main__":
    # Initialize the WebDriver once at startup.
    init_driver()
    try:
        app.run(debug=True)
    finally:
        if driver:
            driver.quit()

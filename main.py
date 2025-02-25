import os
import time

import requests
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager

# Setup Firefox WebDriver (Headless Mode)
options = webdriver.FirefoxOptions()
options.add_argument("--headless")  # Run in headless mode
options.add_argument("--width=1920")
options.add_argument("--height=1080")

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


# Initialize WebDriver
service = Service(GeckoDriverManager().install())
driver = webdriver.Firefox(service=service, options=options)

# Load uBlock Origin extension
ublock_extension_path = download_ublock_extension()
driver.install_addon(ublock_extension_path, temporary=True)

# Target URL
url = "https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Force/Force-Interactive"

try:
    print("Loading page...")
    driver.get(url)

    start_time = time.time()
    max_wait_time = 10  # Max time to keep looking (seconds)

    while time.time() - start_time < max_wait_time:
        iframes = driver.find_elements(By.TAG_NAME, "iframe")

        for iframe in iframes:
            src = iframe.get_attribute("src")
            if src and "PhysicsClassroom" in src:
                print(f"\nFound Target Iframe: {src}")
                driver.quit()
                exit(0)  # Quit immediately after finding the target iframe

        time.sleep(0.1)

    print("\nNo target iframe found within the time limit.")

except Exception as e:
    print(f"Error: {e}")

finally:
    driver.quit()
    print("\nDone.")

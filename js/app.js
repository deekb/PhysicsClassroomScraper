import {createNotification} from './notification.js'; // Import the notification module

const BASE_URL = "https://www.physicsclassroom.com";
const PROXY_URL = "https://corsproxy.io/?";  // Use CORS proxy URL

// Main application logic for extracting the iframe URL
document.getElementById("extract-btn").addEventListener("click", async () => {
    const url = document.getElementById("url-input").value;
    const loadingSpinner = document.getElementById("loading-spinner");

    // Show the loading spinner
    loadingSpinner.classList.add("is-active");

    if (!url) {
        createNotification("Please enter a URL", "is-danger");
        loadingSpinner.classList.remove("is-active"); // Hide spinner
        return;
    }

    try {
        // Fetch the content of the given URL using the CORS proxy
        const response = await fetch(PROXY_URL + url);
        if (!response.ok) {
            createNotification("Failed to fetch the URL", "is-danger");
            return;
        }
        const content = await response.text();

        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        // Find the iframe element with `allowfullscreen` attribute
        const iframe = doc.querySelector("iframe[allowfullscreen]");
        if (!iframe) {
            createNotification("Failed to get Iframe (check URL)", "is-danger");
            return;
        }

        // Get the src attribute and construct the full URL
        const iframeSrc = iframe.getAttribute("src");
        const iframeFullSrc = BASE_URL + iframeSrc;

        // Display the extracted URL in the textarea
        const resultTextArea = document.getElementById("result");
        resultTextArea.value = iframeFullSrc;

        // Display success message
        createNotification("Iframe link extracted and ready to copy!", "is-success");
    } catch (error) {
        console.error("Error:", error);
        createNotification("An error occurred while extracting the iframe.", "is-danger");
    } finally {
        // Hide the loading spinner when done
        loadingSpinner.classList.remove("is-active");
    }
});

// Initialize Clipboard.js for copying text
new ClipboardJS('#copy-btn').on('success', () => {
    createNotification("Copied to clipboard successfully!", "is-success");
});

// Help button event listener to display the Help modal
const helpBtn = document.getElementById("help-btn");
const helpModal = document.getElementById("help-modal");
const helpModalCloseBtn = document.getElementById("help-modal-close-btn");
const helpModalOkBtn = document.getElementById("help-modal-ok-btn");

// Function to show the help modal
function showHelpModal() {
    helpModal.classList.add("is-active");
}

// Function to hide the help modal
function hideHelpModal() {
    helpModal.classList.remove("is-active");
}

// Event listeners to handle opening and closing the Help modal
helpBtn.addEventListener("click", showHelpModal);
helpModalCloseBtn.addEventListener("click", hideHelpModal);
helpModalOkBtn.addEventListener("click", hideHelpModal);

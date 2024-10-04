import { createNotification } from './notification.js'; // Import the notification module

const BASE_URL = "https://www.physicsclassroom.com";
const PROXY_URL = "https://corsproxy.io/?"; // Use CORS proxy URL

// Event listener for the Extract button
document.getElementById("extract-btn").addEventListener("click", () => {
    const url = document.getElementById("url-input").value;

    if (!url) {
        createNotification("Please enter a URL", "is-danger");
        return;
    }

    toggleLoadingSpinner(true);
    handleExtraction(url);
});

// Main function to handle extraction logic
async function handleExtraction(url) {
    try {
        const content = await fetchPageContent(url);
        const doc = parseHTML(content);

        // Look for the iframe in the contentHolder div
        let iframeFullSrc = findIframeSrcInContentHolder(doc);

        if (!iframeFullSrc) {
            // If no iframe found, look for the first matching <a> link and check that page for an iframe
            const firstMatchingLink = findFirstMatchingLink(doc);
            if (firstMatchingLink) {
                const linkHref = firstMatchingLink.getAttribute("href");
                const fullLinkHref = linkHref.startsWith("http") ? linkHref : BASE_URL + linkHref;

                createNotification(`Navigating to ${fullLinkHref} to find iframe`, "is-info");

                // Fetch the content of the linked page and look for iframe again
                const linkedContent = await fetchPageContent(fullLinkHref);
                const linkedDoc = parseHTML(linkedContent);
                iframeFullSrc = findIframeSrcInContentHolder(linkedDoc);
            }
        }

        // Display the extracted iframe URL or show an appropriate message
        displayIframeUrl(iframeFullSrc);
    } catch (error) {
        console.error("Error:", error);
        createNotification("An error occurred while extracting content.", "is-danger");
    } finally {
        toggleLoadingSpinner(false);
    }
}

// Fetch the page content using the CORS proxy
async function fetchPageContent(url) {
    const response = await fetch(PROXY_URL + url);
    if (!response.ok) {
        throw new Error("Failed to fetch the URL");
    }
    return await response.text();
}

// Parse the HTML content and return the Document object
function parseHTML(content) {
    const parser = new DOMParser();
    return parser.parseFromString(content, "text/html");
}

// Find and return the src of the first iframe inside the contentHolder div
function findIframeSrcInContentHolder(doc) {
    const contentHolder = doc.getElementById("contentHolder");
    if (contentHolder) {
        const iframe = contentHolder.querySelector("iframe");
        if (iframe) {
            const iframeSrc = iframe.getAttribute("src");
            return iframeSrc.startsWith("http") ? iframeSrc : BASE_URL + iframeSrc;
        }
    }
    return null; // No iframe found
}

// Find the first matching <a> link inside contentHolder within a specific <h3> structure
function findFirstMatchingLink(doc) {
    const contentHolder = doc.getElementById("contentHolder");
    if (contentHolder) {
        return contentHolder.querySelector('h3[style="text-align: center;"] > a[href^="/mop/"]');
    }
    return null; // No matching link found
}

// Display the extracted iframe URL or a failure message in the result textarea
function displayIframeUrl(iframeFullSrc) {
    const resultTextArea = document.getElementById("result");
    resultTextArea.value = iframeFullSrc ? iframeFullSrc : "No iframe link found in the provided content.";
    const message = iframeFullSrc ? "Iframe link extracted and ready to copy!" : "No iframe found.";
    createNotification(message, iframeFullSrc ? "is-success" : "is-warning");
}

// Toggle the loading spinner visibility
function toggleLoadingSpinner(isActive) {
    const loadingSpinner = document.getElementById("loading-spinner");
    if (isActive) {
        loadingSpinner.classList.add("is-active");
    } else {
        loadingSpinner.classList.remove("is-active");
    }
}

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

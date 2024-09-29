const BASE_URL = "https://www.physicsclassroom.com";
const PROXY_URL = "https://corsproxy.io/?";  // Use CORS proxy URL

document.getElementById("extract-btn").addEventListener("click", async () => {
    const url = document.getElementById("url-input").value;
    if (!url) {
        alert("Please enter a URL");
        return;
    }

    try {
        // Fetch the content of the given URL using the CORS proxy
        const response = await fetch(PROXY_URL + url);
        if (!response.ok) {
            alert("Failed to fetch the URL");
            return;
        }
        const content = await response.text();

        // Parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        // Find the iframe element with `allowfullscreen` attribute
        const iframe = doc.querySelector("iframe[allowfullscreen]");
        if (!iframe) {
            alert("Failed to get Iframe (check URL)");
            return;
        }

        // Get the src attribute and construct the full URL
        const iframeSrc = iframe.getAttribute("src");
        const iframeFullSrc = BASE_URL + iframeSrc;

        // Display the extracted URL in the textarea
        const resultTextArea = document.getElementById("result");
        resultTextArea.value = iframeFullSrc;

        // Update message
        document.getElementById("message").innerText = "Iframe link extracted and ready to copy!";
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while extracting the iframe.");
    }
});

// Initialize Clipboard.js for copying text
new ClipboardJS('#copy-btn');


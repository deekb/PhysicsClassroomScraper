import { createNotification } from './notification.js';

document.getElementById("extract-btn").addEventListener("click", () => {
    const url = document.getElementById("url-input").value;

    if (!url) {
        createNotification("Please enter a URL", "is-danger");
        return;
    }

    toggleLoadingSpinner(true);
    extractIframe(url);
});

async function extractIframe(url) {
    try {
        const response = await fetch("/extract", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to extract iframe.");
        }

        const data = await response.json();
        document.getElementById("result").value = data.iframe_src;
        createNotification("Iframe extracted successfully!", "is-success");
    } catch (error) {
        console.error("Error:", error);
        createNotification(error.message, "is-danger");
    } finally {
        toggleLoadingSpinner(false);
    }
}

function toggleLoadingSpinner(isActive) {
    const loadingSpinner = document.getElementById("loading-spinner");
    if (isActive) {
        loadingSpinner.classList.add("is-active");
    } else {
        loadingSpinner.classList.remove("is-active");
    }
}

// (Optional) Additional code to handle the Help modal can be added here.

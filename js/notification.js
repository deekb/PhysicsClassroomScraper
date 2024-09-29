/**
 * Creates and displays a Bulma notification.
 * @param {string} message - The message to display.
 * @param {string} type - The Bulma color type for the notification (e.g., 'is-success', 'is-danger').
 */
function createNotification(message, type) {
    // Create the notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.style.marginBottom = "10px";
    notification.style.display = "flex";
    notification.style.alignItems = "center";  // Vertically center the elements
    notification.style.justifyContent = "space-between";  // Space between delete button and text

    // Add close button and message text
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.style.marginLeft = "10px";  // Add spacing to prevent overlapping text
    deleteButton.addEventListener("click", () => notification.remove());
    notification.appendChild(deleteButton);

    const messageText = document.createElement("span");
    messageText.textContent = message;
    messageText.style.flexGrow = "1";  // Allow message text to use available space
    messageText.style.paddingRight = "15px";  // Add padding to ensure space between text and close button
    notification.appendChild(messageText);

    // Add the notification to the notification container
    const container = document.getElementById("notification-container");
    container.appendChild(notification);

    // Remove the notification automatically after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export the createNotification function to be used in other modules
export { createNotification };

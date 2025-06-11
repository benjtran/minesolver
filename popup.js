console.log("popup.js loaded");

// Listen for solve button to be clicked
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn");
    btn.addEventListener("click", () => {
        console.log("Button clicked");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            let tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { solving: true }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Message failed:", chrome.runtime.lastError.message);
                } else {
                    console.log("Response from content script:", response);
                }
            });
        });
    });
});
console.log("background.js loaded");

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (typeof message.game_entered === "boolean") {
        console.log("Received game_entered boolean:", message.game_entered);
        chrome.action.setPopup({ popup: message.game_entered ? "popup_2.html" : "popup_1.html" });
    }
});
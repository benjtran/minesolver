/*
============================================================================
   Minesolver - content.js
   Author: Benjamin Tran
   Description: Active popup when game is detected
============================================================================
*/



console.log("content.js loaded");

/* =========================
   1. Game Entering Detection
   ========================= */

let game_entered = false;

// Sets the game as "entered" and sends status to background.js
function gameEntered() {
    console.log("entered game");
    game_entered = true;
    console.log(game_entered);
    chrome.runtime.sendMessage({ game_entered: game_entered})
}

// Sets the game as "not entered" and sends status to background.js
function gameExited() {
    console.log("exited game");
    game_entered = false;
    console.log(game_entered);
    chrome.runtime.sendMessage({ game_entered: game_entered})
}

// On click, these elements enter the game
const play_button = document.querySelector('.niO4u.VDgVie.SlP8xc');
const play_overlay = document.querySelector('.YQ4gaf')

// On click, these elements exit the game
const exit_button = document.querySelector('.c1V3Fb.eqeexb');
const exit_overlay = document.querySelector('.R2HGHf.VDgVie');

if (play_button) {
    play_button.onclick = gameEntered;
}

if (play_overlay) {
    play_overlay.onclick = gameEntered;
}

if (exit_button) {
    exit_button.onclick = gameExited;
}

if (exit_overlay) {
    exit_overlay.onclick = gameExited;
}



/* =========================
   2. Game Solving
   ========================= */
   
// Listens for a click on the solve button
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (typeof message.solving === "boolean") {

        console.log("Received boolean:", message.solving);
    
        // Searches for the canvas that contains the game board and saves its relative position and size
        const canvas = document.querySelector('canvas.ecwpfc');
        const board = canvas.getBoundingClientRect();

        // Where to click relative to the top left corner of the board
        const relativeX = 20;
        const relativeY = 20;
        const absX = board.left + relativeX;
        const absY = board.top + relativeY;

        // Click events to simulate a full click cycle
        const click_events = ['mousedown', 'mouseup', 'click'];

        // Run and send each click event
        for (let i = 0; i < click_events.length; i++) {

            // Create a mouse event object to dispatch for each click event
            // ***Make this a function later
            const evt = new MouseEvent(click_events[i], {
                cancelable: true,
                view: window,
                clientX: absX,      // Position X
                clientY: absY,      // Position Y
                button: 0           // Left Click
            });

            canvas.dispatchEvent(evt);
        }

        console.log("Clicked on board!");
        // Respond back to popup
        sendResponse({ received: true, value: message.solving });
    }
});
// Convert page coordinates to canvas-relative ones

chrome.runtime.onMessage.addListener()
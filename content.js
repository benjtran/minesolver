console.log("content.js loaded");

let game_entered = false;

function gameEntered() {
    console.log("entered game");
    game_entered = true;
    console.log(game_entered);
}

function gameExited() {
    console.log("exited game");
    game_entered = false;
    console.log(game_entered);
}

const play_button = document.querySelector('.niO4u.VDgVie.SlP8xc');
const exit_button = document.querySelector('.c1V3Fb.eqeexb')

if (play_button) {
    play_button.onclick = gameEntered;
}

if (exit_button) {
    exit_button.onclick = gameExited;
}
/*
============================================================================
   Minesolver - content.js
   Author: Benjamin Tran
   Description: Active popup when game is detected
============================================================================
*/
class Board {
  constructor() {
    this.rows = 8;
    this.cols = 10;

    this.board_state = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }

  captureCell(board, x, y) {
    const length = 45; // width and height of each cell
    const cell = document.createElement('canvas');
    const true_x = x * length;
    const true_y = y * length;
    cell.width = length;
    cell.height = length;

    const cell_ctx = cell.getContext('2d');
    cell_ctx.drawImage(board, true_x, true_y, length, length, 0, 0, length, length);

    // Use the loaded model for prediction
    const dataURL = cell.toDataURL('image/png');
    const cell_image = dataURL.replace(/^data:image\/png;base64,/, '');
    return cell_image;
  }

  async readCell(cell_image, i, j) {
    const response = await fetch('https://serverless.roboflow.com/infer/workflows/school-mu231/custom-workflow-3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: '0J470nlTFy0obprDGPDU',
        inputs: {
          "image": { "type": "base64", "value": cell_image }
        }
      })
    });

    const data = await response.json();

    let cell_value = data.outputs[0].predictions.top;

    if (cell_value === "empty") {
      cell_value = 0;
    } else if (cell_value === "unknown") {
      cell_value = -1;
    }

    this.board_state[i][j] = cell_value;
  }

  async readBoard(board) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let cell_image = this.captureCell(board, j, i)
        await this.readCell(cell_image, i, j);
        console.log(i + " " + j)
      }
    }
    this.board_state[0][0] = 0;
    console.log(this.board_state)
  }
}

function getBestMove(board) {
  const rows = board.length;
  const cols = board[0].length;

  const inBounds = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  const safeMoves = new Set();

  const getNeighbors = (r, c) => {
    return directions
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => inBounds(nr, nc));
  };

  // Step 1: Identify guaranteed safe moves
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell < 1 || cell > 8) continue;

      const neighbors = getNeighbors(r, c);
      const unknowns = neighbors.filter(([nr, nc]) => board[nr][nc] === -1);
      const knownMines = neighbors.filter(([nr, nc]) => board[nr][nc] === 9).length;

      if (unknowns.length === 0) continue;

      // Case 1: All unknowns are mines → we can't use them
      if (unknowns.length === cell - knownMines) {
        continue;
      }

      // Case 2: All mines accounted for → rest are safe
      if (knownMines === cell) {
        for (const [nr, nc] of unknowns) {
          safeMoves.add(`${nr},${nc}`);
        }
      }
    }
  }

  // Step 2: Return a guaranteed safe move
  if (safeMoves.size > 0) {
    const [r, c] = Array.from(safeMoves)[0].split(',').map(Number);
    console.log(`Safe to click: [${r}, ${c}]`);
    return [r, c];
  }

  // Step 3: No guarantees — use a heuristic guess based on proximity to numbers
  let bestGuess = null;
  let lowestRisk = Infinity;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== -1) continue;

      let risk = 0;
      let contributing = 0;

      for (const [nr, nc] of getNeighbors(r, c)) {
        const val = board[nr][nc];
        if (val >= 1 && val <= 8) {
          const neighbors = getNeighbors(nr, nc);
          const unknowns = neighbors.filter(([rr, cc]) => board[rr][cc] === -1).length;
          if (unknowns > 0) {
            risk += val / unknowns;
            contributing++;
          }
        }
      }

      if (contributing > 0) {
        const avgRisk = risk / contributing;
        if (avgRisk < lowestRisk) {
          lowestRisk = avgRisk;
          bestGuess = [r, c];
        }
      }
    }
  }

  if (bestGuess) {
    console.log(`No safe moves. Best guess: [${bestGuess[0]}, ${bestGuess[1]}] with estimated risk ${lowestRisk.toFixed(2)}`);
    return bestGuess;
  }

  // Step 4: Fallback to any unrevealed cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === -1) {
        console.log(`No hints available. Clicking first unrevealed cell: [${r}, ${c}]`);
        return [r, c];
      }
    }
  }

  console.log("No moves left.");
  return null;
}


function clickBoard(x, y) {
  const canvas = document.querySelector('canvas.ecwpfc');
  const board = canvas.getBoundingClientRect();
  // Where to click relative to the top left corner of the board
  const absX = board.left + x;
  const absY = board.top + y;

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
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function solveBoard(game_board, b) {
  let iterations = 50;
  let best_move;
  for (let i = 0; i < iterations; i++) {
    await b.readBoard(game_board); // wait for board to be fully read
    best_move = getBestMove(b.board_state);
    console.log("Best move: " + best_move[1] + " " + best_move[0])
    clickBoard(best_move[1] * 45 + 10, best_move[0] * 45 + 10);
    await sleep(1000);
    console.log("Board read and move made");
  }
}

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
  chrome.runtime.sendMessage({ game_entered: game_entered })
}

// Sets the game as "not entered" and sends status to background.js
function gameExited() {
  console.log("exited game");
  game_entered = false;
  console.log(game_entered);
  chrome.runtime.sendMessage({ game_entered: game_entered })
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

    clickBoard(10, 10);

    // Respond back to popup
    sendResponse({ received: true, value: message.solving });

    const game_board = document.querySelector('canvas');
    const b = new Board();
    solveBoard(game_board, b);
  }
});
// Convert page coordinates to canvas-relative ones

// chrome.runtime.onMessage.addListener()
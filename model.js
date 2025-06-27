class Board {
  constructor() {
    this.board_state = [[]];
  }
    async readCell(cell_image) {
        const response = await fetch('https://serverless.roboflow.com/minesolver-v2/2?api_key=0J470nlTFy0obprDGPDU', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: {
                    type: "base64",
                    value: cell_image
                }
            })
        });
        return await response.json();
    }   

  async readBoard(board) {

    const length = 30; // width and height of each cell

    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 16; j++) {
        const cell = document.createElement('canvas');
        const x = j * length;
        const y = i * length;
        cell.width = length;
        cell.height = length;

        const cell_ctx = cell.getContext('2d');
        cell_ctx.drawImage(board, x, y, length, length, 0, 0, length, length);

        // Use the loaded model for prediction
        const dataURL = cell.toDataURL('image/png'); // returns something like "data:image/png;base64,...."
        const cell_image = dataURL.replace(/^data:image\/png;base64,/, ''); // remove the prefix

        const prediction = await this.readCell(cell_image);
        console.log(`Prediction for cell [${i},${j}]:`, prediction);
        // TODO: Save prediction to this.board_state[i][j]
      }
    }
  }
}

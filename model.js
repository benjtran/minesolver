// board is the full Minesweeper canvas
const board = document.querySelector('canvas');

// 14 x 16 minesweeper grid, iterate through all cells
for (let i = 0; i < 14; i++) {
    for (let j = 0; j < 16; j++) {
        // Create a temporary canvas for the cropped cell
        const cell = document.createElement('canvas');
        let x = j * 30;
        let y = i * 30;
        let length = 30; // width and height of the cell
        cell.width = length;
        cell.height = length;

        const cell_ctx = cell.getContext('2d');

        // Copy part of the board onto the cell canvas
        cell_ctx.drawImage(board, x, y, length, length, 0, 0, length, length);

        // Convert to data URL
        const dataURL = cell.toDataURL('image/png');

        // Open image in new tab
        // const newWindow = window.open();
        // newWindow.document.write(`<img src="${dataURL}" alt="Minesweeper Cell"/>`);

        // Create a download link and trigger it
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'cell.png'; // filename for the download
        document.body.appendChild(link);
        link.click(); // triggers download
        document.body.removeChild(link); // clean up

        await new Promise(r => setTimeout(r, 100))
    }
}
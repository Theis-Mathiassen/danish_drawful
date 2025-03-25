const socket = io();
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Example drawing setup
let drawing = false;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    draw(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    draw(e.offsetX, e.offsetY);
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    sendCanvasData(); // Send data when drawing stops
});

function draw(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
}

function sendCanvasData() {
    const dataURL = canvas.toDataURL();
    socket.emit('canvasUpdate', dataURL);
}


socket.on('timeUp', () => {
    alert('Time is up!');
    // Handle the end of the round (e.g., show results, clear canvas)
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas.
});

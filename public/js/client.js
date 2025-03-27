const socket = io();

function createSelectResponseForm() {
    // Create the form element
    const GuessSelectForm = document.createElement('div');
    GuessSelectForm.id = 'guess-select-form';
    GuessSelectForm.classList.add('hidden');


    // Create the heading
    const heading = document.createElement('h2');
    heading.textContent = 'Vælg den korrekte tekst';

    
    // Create the unordered list element
    const ul = document.createElement('ul');
    ul.id = 'solution-list';


    // Append the elements to the form
    GuessSelectForm.appendChild(heading);
    GuessSelectForm.appendChild(ul);

    // Append the form to the body or any other desired container
    document.body.appendChild(GuessSelectForm);

    return GuessSelectForm;
}

// Call the function to create and append the createSelectResponse form
const selectGuessForm = createSelectResponseForm();
const solutionList = document.getElementById('solution-list');





function populateSolutionList (guessList) {
    solutionList.innerHTML = '';
    if (guessList === undefined) {
        console.log('Undefined guessList')
    }

    for (const guess in guessList) {
        if (Object.prototype.hasOwnProperty.call(guessList, guess)) {
            const li = document.createElement('li');
            li.textContent = guessList[guess];
            li.addEventListener('click', () => {
                select_guess(guess);
            });
            solutionList.appendChild(li);
        }
    }
}


function select_guess (guess) {
    socket.emit('guess_selected', guess);
}

function createImageGuessForm() {
    // Create the form element
    const ImageGuessForm = document.createElement('div');
    ImageGuessForm.id = 'image-guess-form';
    ImageGuessForm.classList.add('hidden');

    // Create the heading
    const heading = document.createElement('h2');
    heading.textContent = 'Gæt hvad billedet ligner';

    // Create the input field
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'guess-input';
    usernameInput.placeholder = 'Et gæt';

    // Create the button
    const guessButton = document.createElement('button');
    guessButton.id = 'guess-button';
    guessButton.textContent = 'Gæt';

    // Append the elements to the form
    ImageGuessForm.appendChild(heading);
    ImageGuessForm.appendChild(usernameInput);
    ImageGuessForm.appendChild(guessButton);

    // Append the form to the body or any other desired container
    document.body.appendChild(ImageGuessForm);

    // Add event listeners for the button and input
    guessButton.addEventListener('click', handleGuess);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });

    return ImageGuessForm; // Return the form element if needed
}

// Call the function to create and append the login form
const guessFormElement = createImageGuessForm(); // Store the form element if you need to reference it later

// Get the elements from the created form.
const guessForm = document.getElementById('image-guess-form');
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');


function handleGuess () {
    guess = guessInput.value.trim();
    if (username === "") {
        alert("Indtast dit gæt"); // Basic validation
        return;
    }

    // Emit the username to the server
    socket.emit('guess', guess);
}

function createLoginForm() {
    // Create the form element
    const loginForm = document.createElement('div');
    loginForm.id = 'login-form';

    // Create the heading
    const heading = document.createElement('h2');
    heading.textContent = 'Enter Username';

    // Create the input field
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username-input';
    usernameInput.placeholder = 'Navn';

    // Create the button
    const loginButton = document.createElement('button');
    loginButton.id = 'login-button';
    loginButton.textContent = 'Deltag i spil';

    // Append the elements to the form
    loginForm.appendChild(heading);
    loginForm.appendChild(usernameInput);
    loginForm.appendChild(loginButton);

    // Append the form to the body or any other desired container
    document.body.appendChild(loginForm);

    // Add event listeners for the button and input
    loginButton.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    return loginForm; // Return the form element if needed
}

// Call the function to create and append the login form
const loginFormElement = createLoginForm(); // Store the form element if you need to reference it later

// Get the elements from the created form.
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');

//Rest of the code remains same
// Function to handle user login
function handleLogin() {
    username = usernameInput.value.trim();
    if (username === "") {
        alert("Please enter a username."); // Basic validation
        return;
    }

    // Emit the username to the server
    socket.emit('submitName', username);

    // Hide the login form and show the game elements
    switch_view('draw');
}

function createCanvas() {
    // Create a wrapper div
    const canvasWrapperDiv = document.createElement('div');
    canvasWrapperDiv.id = 'draw_element'
    canvasWrapperDiv.classList.add('hidden');

    // Create the heading
    const titleElement = document.createElement('h2');
    titleElement.id = 'title';
    //titleElement.className = 'hidden';

    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    //canvas.className = 'hidden';

    // Append the elements to the body
    canvasWrapperDiv.appendChild(titleElement);
    canvasWrapperDiv.appendChild(canvas);

    document.body.appendChild(canvasWrapperDiv)

    return canvasWrapperDiv; // Return the elements if needed
}

// Call the function to create and append the canvas elements
const drawElement = createCanvas();



const canvas = document.getElementById('myCanvas');
const title = document.getElementById('title');
const ctx = canvas.getContext('2d');

// Adjust canvas size on initial load and resize
function resizeCanvas() {
    const containerWidth = document.body.clientWidth * 0.95; // 95% of body width
    const maxWidth = 500;
    const canvasWidth = Math.min(containerWidth, maxWidth);
    const canvasHeight = window.innerHeight * 0.6666; // 2/3 of window height
    const maxCanvasHeight = window.innerHeight * 0.6666;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Update the canvas's actual dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

resizeCanvas(); // Initial resize
window.addEventListener('resize', resizeCanvas); // Resize on window resize



// Drawing setup
let drawing = false;
let lastX = 0;
let lastY = 0;

function getTouchPos(canvasDom, touchEvent) {
    const rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

function draw(x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);  // Start from the previous point
    ctx.lineTo(x, y);        // Draw a line to the current point
    ctx.lineWidth = 5;       // Set line thickness
    ctx.strokeStyle = 'black'; // Set line color
    ctx.lineCap = 'round';  // Rounded line ends
    ctx.stroke();          // Draw the line

    lastX = x;            // Update lastX and lastY
    lastY = y;
    sendCanvasData();
}

function sendCanvasData() {
    const dataURL = canvas.toDataURL();
    socket.emit('canvasUpdate', dataURL);
}

// Mouse event listeners
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    lastX = e.offsetX;  // Store starting point
    lastY = e.offsetY;
    draw(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const x = e.offsetX;
    const y = e.offsetY;
    draw(x, y);
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

// Touch event listeners
canvas.addEventListener('touchstart', (e) => {
    drawing = true;
    e.preventDefault(); // Prevents scrolling
    const touchPos = getTouchPos(canvas, e);
    lastX = touchPos.x;
    lastY = touchPos.y;
    draw(touchPos.x, touchPos.y);
});

canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    e.preventDefault(); // Prevent scrolling
    const touchPos = getTouchPos(canvas, e);
    draw(touchPos.x, touchPos.y);
});

canvas.addEventListener('touchend', () => {
    drawing = false;
});


function switch_view (view) {
    loginFormElement.classList.add('hidden');
    drawElement.classList.add('hidden');
    guessFormElement.classList.add('hidden');
    selectGuessForm.classList.add('hidden');
    switch (view) {
        case 'login':
            loginFormElement.classList.remove('hidden');
            break;
        case 'draw':
            drawElement.classList.remove('hidden');
            break;
        case 'guess':
            guessFormElement.classList.remove('hidden');
            break;
        case 'select':
            selectGuessForm.classList.remove('hidden');
            break;
        default:
            console.log('Invalid view: ' + view);
            break;
    }       
}






socket.on('connect', () => {
    console.log('Connected to server');
    setTimeout(() => {
        socket.emit('client_connection');
    }, 10)
});



socket.on('timeUp', () => {
    //alert('Time is up!');
});
socket.on('guess_on_image', () => {
    switch_view('guess')
});

socket.on('select_guess_form', (guesses) => {
    console.log('Hello from select_guess_form')
    populateSolutionList(guesses)
    switch_view('select')
});

socket.on('reset', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
socket.on('new_round', (text, time) => {
    console.log('New round: ' + text);
    title.textContent = 'Du skal tegne: ' + text;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});


const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path'); // Import the path module
const { hostname } = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'))

//      /socket id of image / socket id of guess
let guess_storage = {}
//      /socket id of image / socket id of guess selected
let guessSelectedStorage = {}

let user_scores = {}

let drawingSubmitted = {}


let current_image_socketid = ''

let host_socket_id = '';

let current_sleep_timeout;
let current_sleep_resolve;

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/client.html'));
});

// Serve the HTML file
app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/host.html'));
});

let clientCanvasData = {};    // Store canvas data for each client using socket.id as key
let user_names = {}           // Store user name for each client using socket.id as key
let socket_ids = []

const draw_prompts = [
    // Dyr
  "Hurtig snegl",
  "Ballet-elefant",
  "Cyklist-bjørn",
  "Stærk mus",
  "Strikkende haj",
  "LEGO-bæver",
  "Motorcykel-orm",
  "Faldskærms-and",
  "Kramme-pindsvin",
  "Travlt dovendyr",
  "Post-kænguru",
  "Væve-edderkop",
  "Joke-papegøje",
  "Gemmeleg-giraf",
  "Hval i badekar",
  "Dirigent-krabbe",
  "Solbadende flodhest",
  "Billøftende myre",
  "Svedende isbjørn",
  "Knude-slange",
  "Glemsomt egern",
  "Kamel med tre pukler",
  "Frø på stylter",
  "Harmonika-hund",
  "Kat med støvler",
  "Fisk på cykel",
  "Ugle-bibliotekar",
  "Hunde-drøm om kødben",
  "Flyvende gris",
  "Meget lang kat",
  "Ridder på snegl",
  "Abe på skøjter",
  "Høne-tandlæge",
  "Ko-astronaut",
  "Surmulende guldfisk",
  "Ninja-hamster",
  "Hund jagter hale",
  "Træklatrende elefant",
  "Chokolade-gris",
  "Måne-hoppende ko",
  "Hest med briller",
  "Menneske-tællende får",
  "Telefon-skrællende abe",
  "Muse-bange løve",
  "Zebra-malende tiger",
  "Pind-spisende panda",
  "Brugtbil-sælgende ræv",
  "Natkikkert-ugle",
  "Mørkeræd flagermus",
  "Flyvende pingvin",
  "Bold-balancerende sæl",
  "Stribe-vaskende zebra",
  "Horn-pudsende næsehorn",
  "Struds med hovedet i spand",
  "Penge-vaskende vaskebjørn",

  // Ting
  "Vred tekande",
  "Forvirret lyskryds",
  "Løbende stol",
  "Hviskende lampe",
  "Forkølet computer",
  "Nervøs brødrister",
  "Lynlås-bjerg",
  "Dansende robot",
  "Knækket blyant",
  "Trist ballon",
  "Magisk flyvetæppe",
  "Selv-ringende telefon",
  "Strejkende vækkeur",
  "Sladre-køleskab",
  "Højtflyvende toast",
  "Støv-bange støvsuger",
  "Guld-vaskemaskine",
  "Selv-klippende saks",
  "Selv-slående hammer",
  "Regn-bange paraply",
  "Vildfaren nøgle",
  "Pære med god idé",
  "Tids-skruetrækker",
  "Kedelig bog",
  "Selv-malende pensel",
  "Opera-syngende tandbørste",
  "Vejr-kontrollerende fjernbetjening",
  "Kage-søgende kompas",
  "Snydende spillekort",
  "Spidsfindig tegnestift",
  "Selv-gyngende gynge",
  "Gelé-rutsjebane",
  "Hoppende trampolin",
  "Konkurs sparegris",
  "Surt klaver",
  "Rock-violin",
  "Én-tone fløjte",
  "Selfie-kamera",
  "Skændende værktøjskasse",
  "Hammer-bange søm",
  "Over-klistrende limstift",
  "Lektie-spisende papirkurv",
  "Hjemve-ramt globus",
  "Baglæns-kikkert",
  "Omvendt mikroskop",
  "Fremtids-spejl",
  "Baglæns-gående ur",
  "Løgnagtig badevægt",
  "Manglende puslespilsbrik",

  // Mad
  "Syngende sandwich",
  "Sodavands-regn",
  "Salat-bange agurk",
  "Rødmende tomat",
  "Ketchup-badende pomfrit",
  "Grine-fremkaldende løg",
  "Broccoli med ansigt",
  "Selv-spisende pizza",
  "Løbsk ost",
  "Jordbær med overskæg",
  "Elpære-formet pære",
  "Kiks der griner",
  "Smeltet chokolade-hjerte",
  "Over-glade popcorn",
  "Klogt kålhoved",
  "Stirrende spejlæg",
  "Vandmelon staver 'HJÆLP'",
  "Grædende mælkekarton",
  "Søvnløs kaffebønne",
  "Hus-boende champignon",
  "Hale-jagende hotdog",
  "Trompet-spillende peberfrugt",
  "Dansende gulerod",
  "Meget sur citron",
  "TV-kiggende kartoffel",

  // Fantasy & Myter
  "Smartphone-trold",
  "Hornløs enhjørning",
  "Havfrue i sko",
  "Måne-bange varulv",
  "Glemsom heks",
  "Jogging-ridder",
  "Drage-reddende prinsesse",
  "Mørkeræd spøgelse",
  "Fe uden tryllestøv",
  "Tomatjuice-vampyr",
  "Hjerne-søgende zombie",
  "Ferie-nisse",
  "Kyklop med kontaktlinser",
  "Frysende yeti",
  "Stor-have-gnom",
  "Rulleskøjte-kentaur",
  "Vittigheds-gargoil",
  "Glemsom sfinks",
  "Højdeskræk-pegasus",
  "Kramme-kraken",
  "Strikkende spøgelse",
  "Usynlig mand",
  "Monster under sengen",
  "Hemmelighedsfuld dør",

  // Natur & Vejr
  "Firkantet regnbue",
  "Torden på glas",
  "Specielt snefnug",
  "Sladrende vind",
  "Op-ad-bakke flod",
  "Flydende sten",
  "Overfyldt oase",
  "Kildende jordskælv",
  "Musikalsk nordlys",
  "Sjov tåge",
  "Kiks-solformørkelse",
  "Opad-smeltende istap",
  "Surfende bølge",
  "Nedgroende plante",
  "Blød kaktus",
  "Fremtids-vandpyt",
  "Snorkende bjerg",
  "Penge-fældende træ",
  "Candyfloss-tornado",
  "Chokomælks-gejser",
  "Træ med ansigter",
  "To lyn-kæmpende skyer",
  "Møde-holdende træer",
  "Limonade-vandfald",
  "Popcorn-vulkan",
  "Bortflydende ø",
  "Hemmelig bogreol-gang",
  "Dør-hus",
  "Baglæns-by",
  "Spaghetti-bro",
  "Rutsje-regnbue",
  "Stige til månen",
  "Kendt sky-ansigt",
  "Hviskende skov",
  "Sukker-strand",
  "Boblevands-sø",

  // Mennesker & Abstrakt
  "Måne-pandende astronaut",
  "Pandekage-tabende kok",
  "Tørst-slukkende brandmand",
  "Nøgle-søgende betjent",
  "Plante-lyttende læge",
  "Gulerods-skrivende lærer",
  "Selv-klippende frisør",
  "Snegle-jaget postbud",
  "Kiks-hus-bygger",
  "Selvspillende instrument",
  "Uheldig opfinder",
  "Iøjnefaldende spion",
  "Snegle-dommer",
  "Papirfly-pilot",
  "Sokke-detektiv",
  "Popcorn-landmand",
  "Råbende bibliotekar",
  "Usynlig-kat-snublende tjener",
  "Træ-krammende skovhugger",
  "Plastik-vandende gartner",
  "Skater-bedstemor",
  "Mand taber hat",
  "Kæmpestor kaffe",
  "Vampyr-tandlæge",
  "Bristende tankeboble",
  "Forkert ekko",
  "Flyvende idé",
  "Larmende stilhed",
  "Tiden løber ud",
  "Langbenet løgn",
  "Kærligheds-hik",
  "Dårlig undskyldning",
  "Heldigt uheld",
  "Lørdags-mandag",
  "Tvivlende spørgsmålstegn",
  "Tung hemmelighed",
  "Helt forkert vej",
  "Deja-vu igen",
  "Pludselig pære-idé",
  "Gå i ring",
  "Bogstavelig øjen-klap",
  "Mistet strikke-tråd",
  "Lille hvid løgn",
  "Fanden malet på væggen"
    ]


function generateRandomSeed() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
function getRandomNumber(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number') {
      return NaN; // Return NaN if inputs are not numbers
    }
  
    return Math.random() * (max - min) + min;
}


app.get('/api/startround', async (req, res) => { // Make the handler async
    const draw_time = 100000;
    const guess_time = 60000;
    const select_time = 60000;
    const show_result_time = 15000;

    try {
        // Use map to create an array of promises, then await Promise.all
        //prompts = await Promise.all(socket_ids.map(async () => await sendToOllama(getRandomInteger(0,10000))));
        //Try to do 1 after the other.
        let prompts = [];
        let init_id = Math.floor(getRandomNumber(0, draw_prompts.length))
        let i = 0;
        console.log('all sockets: ' + socket_ids);
        for (const socketId of socket_ids) {
            let index = (init_id+i) % draw_prompts.length
            prompts.push(draw_prompts[index]);
            i++;
        }


        console.log(prompts)
        io.to(host_socket_id).emit('new_round', '', draw_time)
        socket_ids.forEach(id => {
            let text = prompts[socket_ids.indexOf(id)];
            io.to(id).emit('new_round', text, draw_time);
        });
        
        console.log(`Round started with a ${draw_time / 1000} second timer.`);
        io.to(host_socket_id).emit('time_bar', draw_time)
        await sleep(draw_time);
        io.emit('timeUp');
        console.log('Time is up! Emitting timeUp event.');
        
        for (let i = 0; i < socket_ids.length; i++) {
            current_image_socketid = socket_ids[i];
            guess_storage[current_image_socketid] = {}
            const user = user_names[socket_ids[i]];
            io.emit('guess_on_image', socket_ids[i], user, guess_time)
            



            if (user === undefined) {
                console.log('User not found for socket id: ' + socket_ids[i]);
                continue;
                // Handle the case where the user is not found
                
            } else {

                console.log('Guessing on image for user: ' + user + 'with socket id: ' + socket_ids[i]);
                console.log('usernames: ' + user_names)
            }
            
            io.to(host_socket_id).emit('time_bar', guess_time)
            await sleep(guess_time);
            guess_storage[current_image_socketid]['correct'] = prompts[i];
            const to_emit = guess_storage[current_image_socketid]
            io.emit('select_guess_form', to_emit, user);

            io.to(host_socket_id).emit('time_bar', select_time)
            await sleep(select_time);
            
            socket_ids.forEach(id => {
                if (current_image_socketid === id) {
                    socket_ids.forEach(other_id => {
                        if (other_id === id) {
                            return;
                        }
                        if (guessSelectedStorage[current_image_socketid][other_id] === 'correct') {
                            user_scores[id] += 500;
                            user_scores[other_id] += 500;
                        }
                    });
                } else {
                    //guess_storage[current_image_socketid].forEach(guess => {
                    //let guess = guess_storage[current_image_socketid][id];
                    socket_ids.forEach(other_id => {
                        if (other_id === id) {
                            return;
                        }
                        if (id === guessSelectedStorage[current_image_socketid][other_id]) {
                            user_scores[id] += 500;
                        }
                    });
    
                    //});
                }
            });

            io.to(host_socket_id).emit('show_result', user_scores, user_names, socket_ids);
            io.to(host_socket_id).emit('time_bar', show_result_time)
            await sleep(show_result_time);



        }

        res.sendStatus(200); // Send a success status
    } catch (error) {
        console.error("Error starting round:", error);
        res.sendStatus(500); // Send an error status
    }
});
function sleep(ms) {
    return new Promise(resolve => {current_sleep_timeout=setTimeout(resolve, ms); current_sleep_resolve = resolve});
}

function checkAllSubmitted () {
    let allSubmitted = true;
    socket_ids.forEach(socket => {
        if (!drawingSubmitted[socket]) {
            allSubmitted = false;
        }
    });
    
    if (allSubmitted) {
        clearTimeout(current_sleep_timeout);
        current_sleep_resolve();
    }
}
  

app.get('/api/canvasdata', (req,res) => {
    result = {}
    for (var user_image in clientCanvasData) {
        if (Object.prototype.hasOwnProperty.call(clientCanvasData, user_image)) {
            if (clientCanvasData[user_image] === undefined || clientCanvasData[user_image].length == 0) {

            } else {
                result[user_image] = clientCanvasData[user_image]
            }
        }
    }
    res.json(result)
})


io.on('connection', (socket) => {
    
    
        
    socket.on('submitName', (user_name) => {
        console.log("Socket_id: "+socket.id + ' submitted name: ' + user_name)
        user_names[socket.id] = user_name; // Old way
        //user_names.push({socketId: socket.id, userName: user_name})
        console.log('users_changed: users: '+ user_names)
        io.to(host_socket_id).emit('users_changed', user_names)
    });
    socket.on('guess', (guess) => {
        const username = user_names[socket.id];
        console.log('User: ' + username +' Guessed: ' + guess)
        guess_storage[current_image_socketid][socket.id] = guess
    });
    socket.on('guess_selected', (guess) => {
        guessSelectedStorage[current_image_socketid][socket.id] = guess;
    });
    socket.on('canvasUpdate', (data) => {
        // Store the received canvas data
        clientCanvasData[socket.id] = data;
    });
    socket.on('submitDrawing', () => {
        drawingSubmitted[socket.id] = true;
        checkAllSubmitted();
    });

    socket.on('host_connection', () => {
        console.log('A Host connected:', socket.id);
        host_socket_id = socket.id;
    });
    socket.on('client_connection', () => {
        console.log('A client connected:', socket.id);
        clientCanvasData[socket.id] = []; // Initialize an array for this client's data
        guess_storage[socket.id] = [];
        guessSelectedStorage[socket.id] = {};
        drawingSubmitted[socket.id] = false;
        user_scores[socket.id] = 0;
        socket_ids.push(socket.id);
        console.log('all sockets: ' + socket_ids);
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        if (socket.id != host_socket_id) {
            const index = socket_ids.indexOf(socket.id);
            if (index !== -1) { // only splice array when item is found
                socket_ids.splice(index, 1); // 2nd parameter means remove one item only
            }
            console.log('all sockets: ' + socket_ids);
            delete user_names[socket.id];
            delete clientCanvasData[socket.id]; // Remove client's data when they disconnect
            
            io.to(host_socket_id).emit('users_changed', user_names)
            delete guess_storage[socket.id];
            delete guessSelectedStorage[socket.id];
            delete user_scores[socket.id];
            delete drawingSubmitted[socket.id];
        }
    });
});



function stopRound() {
    clearTimeout(timer);
    console.log("Round stopped early.");
}



async function sendToOllama(seed) {
    const prompt = "Ignore alt tidligere information. Generer en enkelt, kort sætning, der beskriver noget at tegne. Fokuser på simple handlinger eller velkendte begreber, der er lette at fortolke visuelt. Undgå alt for komplekse eller abstrakte ideer. Sætningen skal være kort og direkte, egnet til et hurtigt tegnespil. Udfordringen skal være inspireret af: "+danskeNavneord[Math.floor(Math.random() * danskeNavneord.length)];
  
    console.log("Seed:", seed, "Prompt:", prompt);
  
    const requestBody = {
      model: 'gemma3:4b',
      prompt: prompt,
      temperature: 1,
      seed: seed,
      stream: false,
    };
  
    console.log("Request Body:", JSON.stringify(requestBody));
  
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  
    if (!response.ok) {
      console.error("Fetch error:", response.status, response.statusText);
      return "Error from Ollama";
    }
  
    const data = await response.json();
    console.log("Response data:", data);
    return data.response;
}


// Example: Start a round with a 30-second timer
//startRound(10000);

//sendToOllama(1000).then((result)=>{
//    console.log(result)
//})

//setTimeout(()=>{
//    io.emit('guess_image', 1000)
//    console.log('emitted: ' + 'guess_image')
//},5000)

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

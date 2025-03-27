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
guess_storage = {}
//      /socket id of image / socket id of guess selected
guessSelectedStorage = []


current_image_socketid = ''

host_socket_id = '';

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/client.html'));
});

// Serve the HTML file
app.get('/host', (req, res) => {
    res.sendFile(path.join(__dirname, './public/views/host.html'));
});

let clientCanvasData = {};    // Store canvas data for each client using socket.id as key
let user_names = []           // Store user name for each client using socket.id as key
let socket_ids = []

const draw_prompts = [
    "En sovende kat drømmer en sommerfugls flugt.",
    "Et æble falder i et spejl af nattehimlen.",
    "En bil kører ind i en regnbue-tunnel.",
    "Et fly lander på en flydende ø af krystaller.",
    "Kaffe-dampe danner et stjernebillede.",
    "En dør åbner til et vandfald af tid.",
    "Regnbuens ende reflekteres i en dråbe honning.",
    "Solen bærer månen som en hat.",
    "Blad-fugle flyver fra en stjernespækket gren.",
    "En bogside forvandles til en flod af ord.",
    "En fugl bygger rede i et urværk.",
    "Huset har et tag af blomster, der visker hemmeligheder.",
    "Manden dirigerer skyer, der danser en historie.",
    "Kvinden cykler på en regnbue, der tegner byen.",
    "Bolden ruller op ad en bakke lavet af musiknoter.",
    "Lampens lys kaster skygger af fremtidige minder.",
    "Blomsten danser i måneskin, der spejler stjerner.",
    "Ost flyver som en boomerang gennem et drømmelandskab.",
    "Kagens lys synger en melodi af smeltende stjerner.",
    "Ballonen bærer et hus gennem et maleri af skyer.",
    "Frøen spiller guitar på en sten i en flydende sø.",
    "Sommerfuglen drikker fra en glødende krystalblomst.",
    "Citronen bliver til en midnatssol.",
    "Skyen former sig som et ansigt, der griner af tiden.",
    "Katten sniger sig gennem en by lavet af papirklip.",
    "Bjørnen danser med træer, der udveksler hemmeligheder.",
    "Musen styrer et rumskib, der laver ostemælkeveje.",
    "Blomsten vokser i en vulkan, der spyr regnbuer.",
    "Guleroden flyver med vinger af sommerfuglevinger.",
    "Båden sejler på en flod af stjernestøv.",
    "Træet har huse i grene lavet af drømme.",
    "Cirklen hopper gennem en labyrint af spejle.",
    "Trekanten flyver som et fly med vinger af papir.",
    "Firkanten åbner sig som en bog med levende sider.",
    "Stjernen falder som en regn af lysende fjer.",
    "Månen danser med skyer, der ændrer form.",
    "Paraplyer flyver i regnen som fugle med blade.",
    "Skygger danser en ballet i sollyset.",
    "Træerne laver musik med vinden som et kor.",
    "Snefnug tegner historier i luften.",
    "Is smelter og bliver til en flod af stjerner.",
    "Te-dampe danner et landskab af drømme.",
    "Saltkringle svømmer i et hav af sukkerkrystaller.",
    "Slikkepinden flyver til månen med vinger af karamel.",
    "Citronen griner, så bobler af lys flyder op.",
    "Kaffe fortæller vittigheder, der smelter i munden.",
    "Sneglen vinder et kapløb mod en bil på et spejl af lys.",
    "Bilen danser i trafikken af drømme-biler.",
    "Bjerget synger en melodi, der vækker stjerner.",
    "Dalen er fyldt med blomster, der lyser som stjerner.",
    "Floden har broer af regnbuer og huse af lys.",
    "Stien fører til en by lavet af stjerner.",
    "Manden flyver på en drage lavet af avissider.",
    "Pigen tegner verden med stjerner, der danner byer.",
    "Klovnen laver skygger af dyr med sine hænder som tegn.",
    "Filmen bliver levende og fortæller historier.",
    "Bogen forvandler læseren til sin hovedperson.",
    "Skovens træer har huse lavet af blade og stjerner.",
    "Byen danser til en musik af lysende skygger.",
    "Tasken fylder sig selv med stjerner og minder.",
    "Kufferten åbner sig og viser en miniature-verden.",
    "Tallerkenen tegner billeder med mad som blæk.",
    "Bilen laver rene spor af lys på en grusvej.",
    "Kniven skærer gennem drømme og laver virkelighed.",
    "Puden former sig som skyer og bærer drømme.",
    "Stenen bliver blød som en sky og flyver.",
    "Fjeren løfter en elefant op i luften med sin lethed.",
    "Kassen flyver som en sommerfugl, der bærer stjerner.",
    "Gaven indeholder en hel by lavet af lys.",
    "Bogen fortæller historier på indersiden af siderne som film.",
    "Lysets skygger danser som dyr i en drøm.",
    "Lampen lyser i mørket med fantasiens lys.",
    "Bilen tegner regnbuer på himlen som stier.",
    "Sneglen bygger huse af stjerner på sin rute.",
    "Lyden danner billeder i luften som hologrammer.",
    "Stemmen tegner ansigter på skyerne med ord.",
    "Himmelen danser med planeterne som lysende perler.",
    "Skyerne fortæller historier med deres former som figurer.",
    "Regndråber tegner billeder på vinduerne som penselstrøg.",
    "Solens stråler tegner smil på blomster som magi.",
    "Blomsten efterlader et aftryk af stjerner, når den visner.",
    "Fuglen tegner mønstre i himlen med sine vinger.",
    "Fisken laver bobler, der tegner historier i vandet.",
    "Manden griner, så skyerne danner smilende ansigter.",
    "Kvinden græder, så tårerne bliver til perler på græsset.",
    "Barnet leger, så træerne danser i vinden.",
    "Hunden gøer, så månen danser i takt med lydene.",
    "Katten spinder, så stjernerne danser i harmoni.",
    "Hesten løber, så skyerne følger som en lysende hale.",
    "Koen græsser, så blomsterne vokser med farverige mønstre.",
    "Grisen roder, så jorden danner mønstre af stjerner.",
    "Hønen pikker, så æggene danser på jorden.",
    "Anden svømmer, så lysspor danser i vandet.",
    "Gåsen flyver, så stjerner danner en lysende sti.",
    "Bien summer, så pollen tegner billeder i luften.",
    "Myren kravler, så glitterspor lyser jorden op.",
    "Edderkoppen fanger stjerner i sit spind som diamanter.",
    "Sommerfuglen laver mønstre med sine vinger som lys.",
    "Sneglen efterlader spor af perlemor som stjerner.",
    "Ormen tegner mønstre med jord og blade som tegn.",
    "Fuglen tegner flugtplaner på gulvet med sine fjer.",
    "Fisken tegner historier med bobler i akvariet.",
    "Katten tegner mønstre med garnnøgler i kurven.",
    "Hunden tegner mønstre med poter i sandet ved stranden.",
    "Aben tegner ansigter med bananer i trækronen.",
    "Elefanten laver sandskulpturer med sin snabel.",
    "Løven tegner mønstre med spor i sandet.",
    "Tigeren laver mønstre med striber i skoven.",
    "Bjørnen tegner mønstre med honning på klipperne.",
    "Ulven tegner stjerner med sine øjne i natten.",
    "Ræven tegner mønstre med halm på marken.",
    "Haren tegner spor med sine poter i sneen.",
    "Pindsvinet tegner cirkler i jorden med sine pigge.",
    "Egernet tegner mønstre med nødder i træet.",
    "Musen tegner spor med ost i sit hul.",
    "Rotten tegner graffiti med kul i kloakken.",
    "Frøen tegner mønstre med åkander i søen.",
    "Slangen tegner mønstre med sine spor i græsset.",]


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
    const draw_time = 10000;
    const guess_time = 10000;
    const select_time = 10000;

    try {
        // Use map to create an array of promises, then await Promise.all
        //prompts = await Promise.all(socket_ids.map(async () => await sendToOllama(getRandomInteger(0,10000))));
        //Try to do 1 after the other.
        let prompts = [];
        let init_id = Math.floor(getRandomNumber(0, draw_prompts.length))
        let i = 0;
        console.log('all sockets: ' + socket_ids)
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
        sleep(draw_time).then(async () => {
            io.emit('timeUp');
            console.log('Time is up! Emitting timeUp event.');
            
            for (let i = 0; i < socket_ids.length; i++) {
                current_image_socketid = socket_ids[i];
                guess_storage[current_image_socketid] = {}
                io.emit('guess_on_image', socket_ids[i])
                const user = user_names.find(user => user.socketId === socket_ids[i]);

                if (user === undefined) {
                    console.log('User not found for socket id: ' + socket_ids[i]);
                    continue;
                    // Handle the case where the user is not found
                    
                } else {

                    console.log('Guessing on image for user: ' + user.userName + 'with socket id: ' + user.socketId);
                    console.log('usernames: ' + user_names)
                }
                    
                await sleep(guess_time);
                const to_emit = guess_storage[current_image_socketid]
                io.emit('select_guess_form', to_emit);

                await sleep(select_time);
            }

        });
        res.sendStatus(200); // Send a success status
    } catch (error) {
        console.error("Error starting round:", error);
        res.sendStatus(500); // Send an error status
    }
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        //user_names[socket.id] = user_name; // Old way
        user_names.push({socketId: socket.id, userName: user_name})
        console.log('users_changed: users: '+ user_names)
        io.to(host_socket_id).emit('users_changed', user_names)
    });
    socket.on('guess', (guess) => {
        const user = user_names.find(user => user.socketId === socket.id);
        console.log('User: ' + user.userName +' Guessed: ' + guess)
        guess_storage[current_image_socketid][socket.id] = guess
    });
    socket.on('guess_selected', (guess) => {
        guessSelectedStorage[current_image_socketid][socket.id] = guess;
    });
    socket.on('canvasUpdate', (data) => {
        // Store the received canvas data
        clientCanvasData[socket.id] = data;
    });

    socket.on('host_connection', () => {
        console.log('A Host connected:', socket.id);
        host_socket_id = socket.id;
    });
    socket.on('client_connection', () => {
        console.log('A client connected:', socket.id);
        clientCanvasData[socket.id] = []; // Initialize an array for this client's data
        guess_storage[socket.id] = [];
        guessSelectedStorage[socket.id] = [];
        socket_ids.push(socket.id)
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        if (socket.id != host_socket_id) {
            const index = socket_ids.indexOf(socket.id);
            if (index > -1) { // only splice array when item is found
                socket_ids = socket_ids.splice(index, 1); // 2nd parameter means remove one item only
            }
            const indexUser = user_names.indexOf(socket.id);
            if (indexUser > -1) { // only splice array when item is found
                user_names = user_names.splice(indexUser, 1); // 2nd parameter means remove one item only
            }
            delete clientCanvasData[socket.id]; // Remove client's data when they disconnect
            
            io.to(host_socket_id).emit('users_changed', user_names)
            delete guess_storage[socket.id];
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

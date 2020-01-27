require('dotenv').config();
const commandDB = require('./commands/commandsDB.json');
const tmi = require('tmi.js');
let chatMessages = 0;
const client = new tmi.Client({
    options:{
        debug:true,
        clientId: process.env.TWITCH_CLIENTID
    },
    connection:{
        reconnect:true,
        secuer:true
    },
    identity:{
        username: process.env.TWITCH_USER,
        password: process.env.TWITCH_TOKEN
    },
    channels:['mux3d']
});

client.connect();

// Counter for chat interact (nobot)

client.on("chat",(channel, userstate, message, self)=>{
    if(self) return;
    if(!userstate.username == "mux3d" || !userstate.username == "muxedbot"){
        chatMessages++
    }
});

// Trigger for commands (in ./commands/commandsDB.json)

client.on('message', (channel, tags, message, self) => {
    console.log(message)
	if(self) return;

    for (let i = 0; i < commandDB.chat.length; i++) {
        if(message.toLowerCase() == commandDB.chat[i].trigger){
            if(commandDB.chat[i].state){
                client.say(channel,commandDB.chat[i].value);
            }
            else{
                client.say(channel,"MrDestructoid Ese comando está desactivado.");
            }
        }
    }

});

// Timers for the Timers commands (in ./commands/commandsDB.json) 

setInterval(() => {
    let now = new Date();
    let minutes = now.getMinutes();
    for (let i = 0; i < commandDB.timers.length; i++) {
        if(minutes == commandDB.timers[i].interval){
            if(commandDB.timers[i].minChat == chatMessages){
                chatMessages = 0
                if(commandDB.timers[i].state){
                    client.say(client.channels[0],commandDB.timers[i].value);
                }
            }
        }
    }
}, 60000);
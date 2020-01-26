require('dotenv').config();
const commandDB = require('./commands/commandsDB.json');
const tmi = require('tmi.js');
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

client.on('message', (channel, tags, message, self) => {
	if(self) return;

    for (let i = 0; i < commandDB.chat.length; i++) {
        if(message.toLowerCase() == commandDB.chat[i].trigger){
            if(commandDB.chat[i].state){
                client.say(channel,commandDB.chat[i].value);
            }
            else{
                client.say(channel,"Ese comando está desactivado. MrDestructoid")
            }
        }
    }

});
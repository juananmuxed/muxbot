require('dotenv').config();
const commandDB = require('./commands/commandsDB.json');
const tmi = require('tmi.js');
var chatMessages = 0;
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

// Trigger for commands (in ./commands/commandsDB.json)

client.on('message', (channel, tags, message, self) => {
	if (self) return;

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

// Command for giveaway and counter

client.on('chat', (channel,userstate,message,self) => {
    if (self) return;
    // Counter
    if(userstate.badges.broadcaster == null){
        chatMessages++
    }
    // Giveaway
    if(message.startsWith('!sorteo') || message == '!sorteo'){
        if(userstate.badges.broadcaster == 1){
            let timeInMinutes = message.split(' ')[1];
            if(isNaN(timeInMinutes) || timeInMinutes == null){timeInMinutes=5}
            let triggerToChat = message.split(' ')[2];
            if(triggerToChat == null){triggerToChat='!ticket'}
            let subMultiply = message.split(' ')[3];
            if(subMultiply == null){subMultiply = 5}
            client.say(channel,'BloodTrail Empieza el sorteo, tenéis '+ timeInMinutes +' minutos para participar. Escribe "'+ triggerToChat +'" en el chat y podrás participar. x'+ subMultiply +' para SUBS.');
            let usersToGiveaway = []
            client.on('chat', (channel,userstate,message,self) => {
                if(message.toLowerCase() == triggerToChat){
                    if(usersToGiveaway.includes(userstate.username)){
                        client.say(channel,'WutFace Ya estabas en el sorteo @'+ userstate.username);
                    }
                    else{
                        if(userstate.subscriber){
                            for (let i = 0; i < subMultiply; i++) {
                                usersToGiveaway.push(userstate.username);
                            }
                        }
                        else{
                            usersToGiveaway.push(userstate.username);
                        }
                    }
                }
            });
            setTimeout(() => {
                if(usersToGiveaway.length == 0){
                    client.say(channel,'4Head Nadie a participado, a si que me lo quedo YO.');
                }
                else{
                    console.log(usersToGiveaway);
                    let winner = Math.floor(Math.random() * usersToGiveaway.length);
                    console.log(usersToGiveaway[winner]);
                    client.say(channel,'PogChamp El sorteo ha acabado y el ganador es... (redoble de tambores)...');
                    client.say(channel,'PogChamp ¡¡Enhorabuena @'+ usersToGiveaway[winner] +'!!');
                }
            }, timeInMinutes*60000);
        }
        else{
            client.say(channel,'4Head Este comando no puedes usarlo HAMIJO.');
        }
    }
})

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
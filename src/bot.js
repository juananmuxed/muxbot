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

// Vars for timers and stats

var startStreamBot = 0;
var restartMessages = [];
var restartMinutes = [];
for (let i = 0; i < commandDB.timers.length; i++) {
    restartMessages.push(0);
    restartMinutes.push(0);
}
var donations = [/* For fill and a final log of the stream */]

// Bot response

function talkingRobot(){
    let number = Math.floor(Math.random() * (commandDB.botResponses.length - 1));
    let sentence = commandDB.botResponses[number + 1].value
    return sentence
}

// Response to action

client.on('action', (channel, userstate, message, self) => {
    if (self) return;
    let botSpeak = talkingRobot();
    if(userstate.badges.broadcaster == null && commandDB.botResponses[0].active){
        client.action(channel,message);
    }
});

// Alerts

client.on('anongiftpaidupgrade',(channel, username, userstate) => {
    if(commandDB.configAlerts.anongiftpaidupgrade){
        client.say(channel,"Kreygasm Alguien muy amable pero que quiere estar en el anonimato @"+ userstate.username);
    }
});

client.on('cheer',(channel, userstate, message) => {
    if(commandDB.configAlerts.cheer){
        if(userstate.bits = 1){
            client.say(channel,"Kreygasm Gracias por el billete de dolar este guarro @"+ userstate.username);
        }
        else{
            client.say(channel,"SeemsGood Gracias por los "+ userstate.bits +" bits @"+ userstate.username);
        }
    }
});

client.on('giftpaidupgrade',(channel, username, sender, userstate) => {
    if(commandDB.configAlerts.giftpaidupgrade){
        client.say(channel,"SeemsGood Gracias @"+ sender +", has regalado una mejora de suscripción a @"+ username);
    }
});

client.on('hosted',(channel, username, viewers, autohost) => {
    if(commandDB.configAlerts.hosted){
        if(autohost){
            client.say(channel,"FrankerZ Gracias @"+ username +", por el Autohost de "+ viewers +" personitas.");
        }
        else{
            client.say(channel,"FrankerZ Gracias @"+ username +", por el Hosteazo de "+ viewers +" personitas.");
        }
    }
});

client.on('raided',(channel, username, viewers) => {
    if(commandDB.configAlerts.raided){
        client.say(channel,"GivePLZ TakeNRG Gracias @"+ username +", por el Raid de "+ viewers +" personitas.");
    }
});

client.on('resub',(channel, username, streakMonths, message, userstate, methods) => {
    if(commandDB.configAlerts.resub){
        if(streakMonths == 0){
            client.say(channel,"DarkMode Gracias @"+ username +"por ese Resub maravilloso.");
        }
        else{
            client.say(channel,"DarkMode Gracias @"+ username +"por ese Resub maravilloso. Llevas "+ streakMonths +" meses aquí a tope.");
        }
    }
    let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
});

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    let senderCount = ~~userstate["msg-param-sender-count"];
    if(commandDB.configAlerts.subgift){
        client.say(channel,"SMOrc Gracias @"+ username +"por ese regalazo a @" + recipient + ". Llevas ya la nada despreciable cifra de "+ senderCount + " regalados.");
    }
});

client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) => {
    if(commandDB.configAlerts.submysterygift){
        client.say(channel,"ThunBeast Gracias al ser de luz anónimo por ese regalazo a @" + username + ". Ha regalado "+ numbOfSubs);
    }
});

client.on('subscription', (channel, username, method, message, userstate) => {
    if(commandDB.configAlerts.subscription){
        client.say(channel,"PogChamp Vivan los suscriptores y sobre todo @" + username);
    }
});

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

    // Bot response

    if(message.toLowerCase().indexOf("muxbot") != -1 || message.toLowerCase().indexOf("muxedbot") != -1 && commandDB.botResponses[0].active){
        let sentence = talkingRobot();
        client.say(channel,sentence + " @" + userstate.username);
    }

    // Counter chat (no streamer)
    if(userstate.badges.broadcaster == null){
        for (let i = 0; i < commandDB.timers.length; i++) {
            restartMessages[i]++;
        }
        startStreamBot++;
    }

    // Giveaway
    if(message.toLowerCase().startsWith('!sorteo') || message == '!sorteo'){
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
                    client.say(channel,'PogChamp El sorteo ha acabado con '+ usersToGiveaway.length +' participante(s) y el ganador es... (redoble de tambores)...');
                    client.say(channel,'PogChamp ¡¡Enhorabuena @'+ usersToGiveaway[winner] +'!!');
                }
            }, timeInMinutes*60000);
        }
        else{
            client.say(channel,'4Head Este comando no puedes usarlo HAMIJO.');
        }
    }
})

// Interval for timers (in ./commands/commandsDB.json) 

setInterval(() => {
    startStreamBot++;
    for (let i = 0; i < commandDB.timers.length; i++) {
        if(commandDB.timers[i].interval != restartMinutes[i]){
            restartMinutes[i]++;
        }
    }
    
    for (let i = 0; i < commandDB.timers.length; i++) {
        if (commandDB.timers[i].interval == restartMinutes[i] && commandDB.timers[i].minChat <= restartMessages[i]) {
            if(commandDB.timers[i].state){
                client.say(client.channels[0],commandDB.timers[i].value);
            }
            restartMessages[i] = 0;
            restartMinutes[i] = 0;
        } 
    }
}, 60000);
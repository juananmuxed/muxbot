require('dotenv').config();
const twitchAPI = require("./utils/twitchFunctionsAPI");
const websocketSLOBS = require("./utils/websocketSLOBS")
const commandDB = require('./commands/commandsDB.json');
const tmi = require('tmi.js');
const Discord = require('discord.js')
const clientDiscord = new Discord.Client()

const client = new tmi.Client({
    options: {
        debug: true,
        clientId: process.env.TWITCH_CLIENT_ID
    },
    connection: {
        reconnect: true,
        secuer: true
    },
    identity: {
        username: process.env.TWITCH_USER,
        password: process.env.TWITCH_TOKEN
    },
    channels: ['mux3d']
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

// Bot response

function talkingRobot() {
    let number = Math.floor(Math.random() * (commandDB.botResponses.length - 1));
    let sentence = commandDB.botResponses[number + 1].value
    return sentence
}

// Response to action

client.on('action', (channel, userstate, message, self) => {
    if (self) return;
    if (commandDB.botResponses[0].active) {
        client.action(channel, message);
    }
});

// Alerts

client.on('anongiftpaidupgrade', (channel, username, userstate) => {
    if (commandDB.configAlerts.anongiftpaidupgrade) {
        client.say(channel, "Kreygasm Alguien muy amable pero que quiere estar en el anonimato @" + userstate.username);
    }
});

client.on('cheer', (channel, userstate, message) => {
    if (commandDB.configAlerts.cheer) {
        if (userstate.bits = 1) {
            client.say(channel, "Kreygasm Gracias por el billete de dolar este @" + userstate.username);
        }
        else {
            client.say(channel, "SeemsGood Gracias por los " + userstate.bits + " bits @" + userstate.username);
        }
    }
});

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
    if (commandDB.configAlerts.giftpaidupgrade) {
        client.say(channel, "SeemsGood Gracias @" + sender + ", has regalado una mejora de suscripción a @" + username);
    }
});

client.on('hosted', (channel, username, viewers, autohost) => {
    if (commandDB.configAlerts.hosted) {
        if (autohost) {
            client.say(channel, "FrankerZ Gracias @" + username + ", por el Autohost de " + viewers + " personitas.");
        }
        else {
            client.say(channel, "FrankerZ Gracias @" + username + ", por el Hosteazo de " + viewers + " personitas.");
        }
    }
});

client.on('raided', (channel, username, viewers) => {
    if (commandDB.configAlerts.raided) {
        client.say(channel, "GivePLZ Gracias @" + username + ", por el Raid de " + viewers + " personitas.");
    }
});

client.on('resub', (channel, username, streakMonths, message, userstate, methods) => {
    if (commandDB.configAlerts.resub) {
        if (streakMonths == 0) {
            client.say(channel, "DarkMode Gracias @" + username + "por ese Resub maravilloso.");
        }
        else {
            client.say(channel, "DarkMode Gracias @" + username + "por ese Resub maravilloso. Llevas " + streakMonths + " meses aquí a tope.");
        }
    }
    let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
});

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    let senderCount = ~~userstate["msg-param-sender-count"];
    if (commandDB.configAlerts.subgift) {
        client.say(channel, "SMOrc Gracias @" + username + "por ese regalazo a @" + recipient + ". Llevas ya la nada despreciable cifra de " + senderCount + " regalados.");
    }
});

client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) => {
    if (commandDB.configAlerts.submysterygift) {
        client.say(channel, "ThunBeast Gracias al ser de luz anónimo por ese regalazo a @" + username + ". Ha regalado " + numbOfSubs);
    }
});

client.on('subscription', (channel, username, method, message, userstate) => {
    if (commandDB.configAlerts.subscription) {
        client.say(channel, "PogChamp Vivan los suscriptores y sobre todo @" + username);
    }
});

// Trigger for commands (in ./commands/commandsDB.json)

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    for (let i = 0; i < commandDB.chat.length; i++) {
        if (message.toLowerCase() == commandDB.chat[i].trigger) {
            if (commandDB.chat[i].state) {
                client.say(channel, commandDB.chat[i].value);
            }
            else {
                client.say(channel, "MrDestructoid Ese comando está desactivado.");
            }
        }
    }

});

client.on('chat', (channel, userstate, message, self) => {
    if (self) return;

    // Function to Change Scene

    function websocketChangeScene(scene) {
        websocketSLOBS.searchScene(scene)
            .then((res) => {
                websocketSLOBS.changeScene(res)
                    .then((response) => {
                        client.say(channel, "MrDestructoid " + response)
                    })
                    .catch((e) => {
                        client.say("4Head " + e)
                    })
            })
            .catch((error) => {
                console.log(error);
                client.say(channel, "4Head " + error)
            })
    }

    // Scene change

    if (message.toLowerCase().startsWith('!escena')) {
        if (message.toLowerCase().startsWith('!escenas')) {
            let text = "DoritosChip "
            for (let i = 0; i < commandDB.scenes.length; i++) {
                text = text.concat(commandDB.scenes[i].id + ": " + commandDB.scenes[i].name + " ")
            }
            if (text != "DoritosChip ") {
                client.say(channel, text)
            }
        }
        else {
            let scene = message.split(' ')[1]
            if (!scene) {
                client.say(channel, "4Head El formato de ese comando es: !escena <numero>. Intenta de nuevo.")
            }
            else {
                let isProtected = false
                for (let i = 0; i < commandDB.scenes.length; i++) {
                    if (commandDB.scenes[i].protected) {
                        isProtected = true
                    }
                }
                if (!isProtected) {
                    websocketChangeScene(scene)
                }
                else {
                    if (userstate['badges-raw']) {
                        if (userstate['badges-raw'].includes('broadcaster/1') || userstate['mod']) {
                            websocketChangeScene(scene)
                        }
                        else {
                            client.say(channel, '4Head Este comando no puedes usarlo HAMIJO.');
                        }
                    }
                    else {
                        client.say(channel, '4Head Este comando no puedes usarlo HAMIJO.');
                    }
                }
            }
        }
    }

    // Bot response

    if (message.toLowerCase().indexOf("muxbot") != -1 || message.toLowerCase().indexOf("muxedbot") != -1 && commandDB.botResponses[0].violent) {
        let sentence = talkingRobot();
        client.say(channel, sentence + " @" + userstate.username);
    }

    // Counter chat (no streamer)
    if (userstate['badges-raw']) {
        if (userstate['badges-raw'].indexOf('broadcaster/1') === -1) {
            for (let i = 0; i < commandDB.timers.length; i++) {
                restartMessages[i]++;
            }
            startStreamBot++;
        }
    }
    else {
        for (let i = 0; i < commandDB.timers.length; i++) {
            restartMessages[i]++;
        }
        startStreamBot++;
    }

    // Support command

    if (message.toLowerCase().startsWith('!hamijo') || message.toLowerCase().startsWith('!su')) {
        let user = message.split(' ')[1];
        if (user == null) {
            client.say(channel, "4Head El formato de ese comando es: !su nickname ó !hamijo nickname. Intenta de nuevo.");
        } else {

            if (user.substring(0, 1) == "@") {
                let patron = /@/g
                let erased = ''
                user = user.replace(patron, erased)
            }

            twitchAPI.userCheck(user)
                .then((response) => {

                    if (response.length == 0) {
                        client.say(channel, "4Head Ese usuario no existe, comprueba que esté bien escrito.");
                    }
                    else {
                        client.say(channel, "PogChamp PogChamp PogChamp Dale amor a esta personita que se lo merece @" + response[0].display_name + " https://www.twitch.tv/" + response[0].login);
                    }

                })
                .catch((error) => {
                    console.log(error);
                })
        }

    }

    // Giveaway
    if (message.toLowerCase().startsWith('!sorteo') || message == '!sorteo') {
        if (userstate['badges-raw']) {
            if (userstate['badges-raw'].includes('broadcaster/1')) {
                let timeInMinutes = message.split(' ')[1];
                if (isNaN(timeInMinutes) || timeInMinutes == null) { timeInMinutes = 5 }
                let triggerToChat = message.split(' ')[2];
                if (triggerToChat == null) { triggerToChat = '!ticket' }
                let subMultiply = message.split(' ')[3];
                if (subMultiply == null) { subMultiply = 5 }
                client.say(channel, 'BloodTrail Empieza el sorteo, tenéis ' + timeInMinutes + ' minutos para participar. Escribe "' + triggerToChat + '" en el chat y podrás participar. x' + subMultiply + ' para SUBS.');
                let usersToGiveaway = []
                client.on('chat', (channel, userstate, message, self) => {
                    if (message.toLowerCase() == triggerToChat) {
                        if (usersToGiveaway.includes(userstate.username)) {
                            client.say(channel, 'WutFace Ya estabas en el sorteo @' + userstate.username);
                        }
                        else {
                            if (userstate.subscriber) {
                                for (let i = 0; i < subMultiply; i++) {
                                    usersToGiveaway.push(userstate.username);
                                }
                            }
                            else {
                                usersToGiveaway.push(userstate.username);
                            }
                        }
                    }
                });
                setTimeout(() => {
                    if (usersToGiveaway.length == 0) {
                        client.say(channel, '4Head Nadie a participado, a si que me lo quedo YO.');
                    }
                    else {
                        console.log(usersToGiveaway);
                        let winner = Math.floor(Math.random() * usersToGiveaway.length);
                        console.log(usersToGiveaway[winner]);
                        client.say(channel, 'PogChamp El sorteo ha acabado con ' + usersToGiveaway.length + ' participante(s) y el ganador es... (redoble de tambores)...');
                        client.say(channel, 'PogChamp ¡¡Enhorabuena @' + usersToGiveaway[winner] + '!!');
                    }
                }, timeInMinutes * 60000);
            }
            else {
                client.say(channel, '4Head Este comando no puedes usarlo HAMIJO.');
            }
        }
        else {
            client.say(channel, '4Head Este comando no puedes usarlo HAMIJO.');
        }
    }
})

// Interval for timers (in ./commands/commandsDB.json) 

setInterval(() => {
    startStreamBot++;
    for (let i = 0; i < commandDB.timers.length; i++) {
        if (commandDB.timers[i].interval != restartMinutes[i]) {
            restartMinutes[i]++;
        }
    }

    for (let i = 0; i < commandDB.timers.length; i++) {
        if (commandDB.timers[i].interval == restartMinutes[i] && commandDB.timers[i].minChat <= restartMessages[i]) {
            if (commandDB.timers[i].state) {
                client.say(client.channels[0], commandDB.timers[i].value);
            }
            restartMessages[i] = 0;
            restartMinutes[i] = 0;
        }
    }
}, 60000);

// Discord utilities

clientDiscord.on('ready', () => {
    console.log(`${clientDiscord.user.username} inda haus!`)
})

let isOnline = false

setInterval( async () => {
    let guild = await clientDiscord.guilds.find(x => x.id === process.env.GUILD_ID)
    let channel = guild.channels.find(x => x.name === process.env.CHANNEL_NAME)
    let checkIsOnline = await twitchAPI.checkOnline()
    if(!isOnline && checkIsOnline){
        isOnline = true
        let image = checkIsOnline.thumbnail_url
        let width = new RegExp('{width}','g')
        let height = new RegExp('{height}','g')
        image = image.replace(width,'320')
        image = image.replace(height,'180')
        console.log('Emitiendo...');
        const embed = new Discord.RichEmbed()
        .setAuthor(clientDiscord.user.username,clientDiscord.user.avatarURL)
        .setColor('#47D6FF')
        .setTitle(checkIsOnline.title)
        .setDescription('🔴ON🔴 => ' + checkIsOnline.user_name + ' está Online. Pasaos por allí a ver que hace el parguelas.')
        .setFooter('Powered by ' + clientDiscord.user.username, clientDiscord.user.avatarURL)
        .setURL('https://www.twitch.tv/' + checkIsOnline.user_name)
        .setImage(image)
        channel.send({embed})
        .then(() => {
            console.log('Mandado mensaje a Discord.')
        })
    }
}, 1000 * 3);


clientDiscord.login(process.env.DISCORD_TOKEN)

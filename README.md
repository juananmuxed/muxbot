<p align=center>
  <img width=300 src="https://i.imgur.com/uvlItJe.jpg"/>
  <br>
  <span><strong>MuXBoT</strong> A simply BoT for my Twitch Channel.<br>
  <a href="https://www.twitch.tv/mux3d">MuX3D Channel</a></span><br><br>
<img src="https://img.shields.io/badge/License-MIT-blue">
<img src="https://img.shields.io/badge/Version-0.4.1-blue">
</p>

## Buy Me a Coffee
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U21M2BE)

## Commands
__Social__
```
!twitter
!discord
!instagram
!github
```

__Support__
```
!cartones !streamloots
<!-- !twitchprime Inactive -->
!instantgaming !ig !jueguicos
```

__Utils__
```
!commandos !coms
!despistao
```

__Support__
Used to support a valid user

```
!su !hamijo

!su <nickname>
```
Response with a link to the nickname's channel in twitch.

__Giveaway__
Only for Streamer account (can change this)
```
!sorteo <timeForEnterInMinutes> <personalizedChatMessageToEnter> <subMultiply>
default: !sorteo = !sorteo 5 !ticket 5
```
_Example_
```
!sorteo 1 !probar 10
```
This launch a 1 minute Giveaway with a ` !probar ` trigger chat and a 10x Sub options to win.

## Timers
A timers for commands in the chat in the DB.json - recursive commands or reminders.

__Format__
```
{
"interval":<minutes>,   // each x minutes trigger if enough chat lines
"value":<text>,   // the text that say a misterious bot
"state":<active true or false>,   // active or not, this is the question
"minChat":<min chats for trigger>   // min lines of chat
},
```
_Example_
```
{"interval":15,"value":"Random text say by the bot","state":true,"minChat":5},

If at least 5 lines of chat and pass 15 minutes before the last time the bot say that, LAUNCH THE ROCKET!!
```

## Change scenes (for OBS Streamlabs)
You can change via Chat the scenes in your OBS Streamlabs (if you use OBS Studio please check this Repo [OBS Websocket](https://github.com/Palakis/obs-websocket)).

__Format__
```
!escena <sceneNumber>
```

To see all applicable scenes

```
!escenas
```

## Alerts
A Subs, resubs, raids and others alerts in the chat. If you like to activate, go to DB.json and change values for every Alert type.

_Example for all false_
```
    "configAlerts":{
        "anongiftpaidupgrade":false,
        "subscription":false,
        "cheer":false,
        "giftpaidupgrade":false,
        "hosted":false,
        "raided":false,
        "resub":false,
        "subgift":false,
        "submysterygift":false
    }
```

## Actions response
Active the bot response for actions in DB.json. `{"active":true}`

_Example_
```
/me kill all
<muxedbot> kill all too
```

## Bot response
Active the bot response to its name in DB.json. `{"violent":true}`
The responses its in the same file, you can Add more.

_Example_
```
<user>: hello muxbot // <user>: hello muxedbot
<muxedbot> Random response
```

## Discord Starting Stream
Added a Connection with Discord.js to the Channel. Operative Bot needed
Send a message to the .env configurated Channel.

## Repositories
- [TMI.js](https://github.com/tmijs/tmi.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [SockJS](https://github.com/sockjs/sockjs-client)
- [Discord.js](https://github.com/discordjs/discord.js)

## License
This project is under MIT - Details [MIT Licence](https://github.com/juananmuxed/muxbot/blob/master/LICENSE)

MIT © [MuXeD](https://muxed.es/)
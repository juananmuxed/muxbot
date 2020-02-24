const SockJS = require('sockjs-client')
const commandDB = require('../commands/commandsDB.json');

function searchScene(scene) {
    let promise = new Promise((resolve,reject) => {
        let sceneName = null
        let resourceId = null
        let sceneSelection = commandDB.scenes
        for (let i = 0; i < sceneSelection.length; i++) {
            if(sceneSelection[i].id == scene){
                sceneName = sceneSelection[i].name
            }
        }
        if(!sceneName){
            reject("Escena no encontrada")
        }
        let scenes = {}
        let sock = new SockJS('http://127.0.0.1:59650/api')
        sock.onopen = () => {
            let objScenes = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getScenes",
                "params": {
                    "resource": "ScenesService"
                }
            }
            sock.send(JSON.stringify(objScenes))
        }
        sock.onmessage = (e) => {
            scenes = JSON.parse(e.data).result
            for (let i = 0; i < scenes.length; i++) {
                if(scenes[i].name == sceneName){
                    resourceId = scenes[i].resourceId
                }
            }
            resolve(resourceId)
            sock.close();
        }
        sock.onerror = (e) => {
            reject('Error con la conexión a OBS')
            console.log(JSON.parse(e));
            sock.close();
        }
    })

    return promise
} 

function changeScene(resourceId) {
    let promise = new Promise((resolve,reject) => {
        let sock = new SockJS('http://127.0.0.1:59650/api')
        sock.onopen = () => {
            let objScenes = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "makeActive",
                "params": {
                    "resource": resourceId
                }
            }
            sock.send(JSON.stringify(objScenes))
        }
        sock.onmessage = (e) => {
            resolve("Escena cambiada")
            sock.close();
        }
        sock.onerror = (e) => {
            reject('Error con la conexión a OBS')
            console.log(JSON.parse(e));
            sock.close();
        }
    })
    return promise
}

module.exports = { searchScene , changeScene }
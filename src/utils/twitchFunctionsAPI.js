const axios = require('axios');
require('dotenv').config();

const client_id = process.env.TWITCH_CLIENT_ID;
const user_ids = process.env.TWITCH_USERID_API;
const client_secret = process.env.TWITCH_CLIENT_SECRET;

var tokenAPI = null;

const authO2Token = axios.create({
    baseURL: 'https://id.twitch.tv/oauth2/token'
});

const helix = axios.create({
    baseURL: 'https://api.twitch.tv/helix'
});

// API petition to bot auth0 token

let getAuthToken = new Promise((resolve,reject) => {
    
    var params = new URLSearchParams();
    params.append('client_id',client_id);
    params.append('client_secret',client_secret);
    params.append('grant_type','client_credentials');
    params.append('scope','moderation:read channel:read:subscriptions user:read:email user:read:broadcast user:edit:broadcast user:edit clips:edit bits:read analytics:read:games analytics:read:extensions')
    authO2Token.post('',params)
    .then(function (response) {
        resolve(response.data);
    })
    .catch(function (error) {
        console.log('Error al generar Token');
        reject(error.response.data);
    });
});

// API petition to streamer subs

let getSubs = new Promise((resolve,reject) => {

    getAuthToken.then((token)=>{
        var params = new URLSearchParams();
        params.append('broadcaster_id', user_ids);
        var options = {
            headers:{'Authorization':'Bearer ' + token.access_token},
            params:params
        }
        helix.get('/subscriptions',options)
        .then(function (response) {
            resolve(response.data);
        })
        .catch(function (error) {
            console.log('Error al recoger subs');
            reject(error.response.data);
        });
    })
    .catch(error => {
        console.log(error);
    })

});

// API petition to streamer data

let checkOnline = new Promise((resolve,reject) => {

    let params = new URLSearchParams();
    params.append('user_id', user_ids);
    let options = {
        headers:{'Client-ID':client_id},
        params:params
    }
    
    helix.get('/streams',options)
    .then(function(response) {
        resolve(response)
    })
    .catch(function(error) {
        reject(error)
    })

});

// Check user exist

function userCheck(user) {
    var promise = new Promise((resolve,reject) => {
        
        getAuthToken.then((token)=>{
            var params = new URLSearchParams();
            params.append('login', user);
            var options = {
                headers:{'Authorization':'Bearer ' + token.access_token},
                params:params
            }

            helix.get('/users',options)
            .then(function(response) {
                resolve(response.data.data)
            })
            .catch(function(error) {
                reject(error)
            })
        })
        .catch(error => {
            console.log(error);
        })

    })

    return promise
}

module.exports = { userCheck , getAuthToken , getSubs , checkOnline }
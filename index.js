var token = "Bearer "
var redirect_uri = "https%3A%2F%2Fmr-hec24.github.io%2F";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const PLAY_ON_DEVICE = "https://api.spotify.com/v1/me/player/play?";
const PAUSE_ON_DEVICE = "https://api.spotify.com/v1/me/player/pause?";



// let access_token = "BQAy-Ii3isHa8oejnTOf7HNhKLzwX955iigu7hF5_1nQm1gHY1-tAe9b6uTchmducA1XKNE2Y1vsxhaQuBcrXvDgKp_VyRKCTHtkkkLDPoja0CqSEuqntP-qHaRSZcHUhpsF3bT-TPAjW6n_q0pe2j3T2lyb"

function onPageLoad() {
    client_id = localStorage.getItem("client_id");
    client_Secret = localStorage.getItem("client_secret");

    if ( window.location.search.length > 0) {
        handleRedirect();
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken (code);
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function fetchAccessToken (code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + redirect_uri;
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi( body ) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
    if (this.staust == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

function requestAuthorization() {
    client_id = document.getElementById("clientID").value;
    client_secret = document.getElementById("clientSecret").value;

    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri;
    url += "&show_dialog=true";
    url += "&scope=playlist-read-private";
    window.location.href = url; // Shows Spotify's Authorization Screen
}


function refreshDevices() {
    callApi( "GET", DEVICES, null, handleDevicesResponse);
}

function handleDeviceResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("devices");
        data.devices.forEach (item => addDevice(item));
    }
    else if (this.status == 401) {
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function refreshAccessToekn() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    callAuthorizationApi(body);
}

function addDevice (item) {
    let node = document.createElement("option");
    node.vale = item.id;
    node.innerHTML = item.name;
    document.getElementById("playlists").appendChild(node);
}

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, rul, true);
    xhr.setRequestHeader('Content-Type', "application/json");
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function removeAllItems (elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

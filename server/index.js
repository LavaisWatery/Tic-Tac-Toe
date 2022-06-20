const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 4949;
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

const CONNECTED_CLIENTS = [];
const ROOMS = [];
ROOMS_NUM = 0;

function sendToClient(client, method, args) {
    client.send(JSON.stringify({ type: "request", method, args }));
}

function getNicknameFromConnection(ws) {
    var id = ws._ultron.id;
    var nick = "";
    CONNECTED_CLIENTS.forEach(client => {
        if(id == client.connectionID) {
            nick = client.nickname;
        }
    });
    return nick;
}

function getIDFromConnection(ws) {
    return ws._ultron.id;
}

function getRoomFromID(id) {
    var room = null;

    ROOMS.forEach(item => {
        if(item.roomID == id) {
            room = item; 
            return;
        }
    })

    return room;
}

wss.on('connection', function connection(ws) {
    // Set on message
    ws.on('message', function incoming(data) {
        const receieved = JSON.parse(data.toString());
        const method = receieved.method;
        const args = receieved.args;

        switch(receieved.method) {
            case "login":
                CONNECTED_CLIENTS.push({nickname: args.nickname, connectionID: ws._ultron.id})
                sendToClient(ws, "login", args);
                break;
            case "logout":
                sendToClient(ws, "logout");
                break;
            case "room.create":
                nick = getNicknameFromConnection(ws);
                ROOMS.push(room = {roomID: ROOMS_NUM, owner: getIDFromConnection(ws), state: "waiting", playersGo: null, viewers: []});
                ROOMS_NUM++;
                sendToClient(ws, "room.create", {room: room, rooms: ROOMS});
                wss.clients.forEach(client => {
                    sendToClient(client, "room.oncreate", {rooms: ROOMS});
                })
                break;
            case "room.updaterooms": {
                sendToClient(ws, "room.updaterooms", {rooms: ROOMS})
                break;
            }
            case "room.join": {
                sendToClient(ws, "room.join", {room: getRoomFromID(args.roomID)})
                break;
            }
            default:
                break;
        }
    });
});

/*
    We want to structure room like 

    {
        roomID: -1
        owner: {_ultron.id} - for tracking
        state: waiting|started
        playersGo: {_ultron.id}
        viewers: {[_ultron.id]} - people viewing the game
    }
*/
server.listen(port, function() {
    console.log("Web Socket Server started on port " + port);
});

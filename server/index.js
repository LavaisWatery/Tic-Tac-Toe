const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 4949;
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

const CONNECTED_CLIENTS = [];
var ROOMS = [];
ROOMS_NUM = 0;

function sendToClient(client, method, args) {
    client.send(JSON.stringify({ type: "request", method, args }));
}

function getNicknameFromConnection(ws) {
    var id = ws._ultron.id;
    var nick = "";
    CONNECTED_CLIENTS.forEach(client => {
        if(id == client.id) {
            nick = client.nickname;
            return;
        }
    });
    return nick;
}

function getConnectionFromID(id) {
    var sock = null;

    CONNECTED_CLIENTS.forEach(client => {
        if(id == client.id) {
            sock = client.ws;
            return;
        }
    })

    return sock;
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

function getClientObjectFromConnection(ws) {
    var id = ws._ultron.id;
    var oj = null;

    CONNECTED_CLIENTS.forEach(client => {
        if(id == client.id) {
            oj = client;
            return;
        }
    })

    return oj;
}

function sendToRoom(room, method, args) {
    room.viewers.forEach((viewer) => {
        sendToClient(getConnectionFromID(viewer.id), method, args);
    });
}

function doesRoomContainViewerWithID(room, id) {
    var viewer = null;

    room.viewers.forEach((v) => {
        if(v.id == id) {
            viewer = v;
            return;
        }
    })

    return viewer;
}

function getPlayersRoom(playerID) {
    var room = null;

    ROOMS.forEach(ruum => {
        if(doesRoomContainViewerWithID(ruum, playerID) != null) {
            room = ruum;
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

        console.log(`args: `, args)

        switch(receieved.method) {
            case "login":
                CONNECTED_CLIENTS.push({player: {nickname: args.nickname, color: args.color, id: ws._ultron.id}, id: ws._ultron.id, ws: ws})
                sendToClient(ws, "login", args);
                break;
            case "logout":
                var room = getPlayersRoom(getIDFromConnection(ws));

                sendToClient(ws, "logout");
                sendToRoom(room, "room.onleave", {room: room})
                break;
            case "room.create":
                nick = getNicknameFromConnection(ws);
                ROOMS.push(room = {roomID: ROOMS_NUM, gameBoard: new Array(9).fill(0), owner: getClientObjectFromConnection(ws).player, state: "waiting", playersGo: null, viewers: []});
                ROOMS_NUM++;
                room.viewers = [];
                room.viewers.push(getClientObjectFromConnection(ws).player);
                sendToClient(ws, "room.create", {room: room});
                wss.clients.forEach(client => {
                    sendToClient(client, "room.oncreate", {rooms: ROOMS});
                })
                break;
            case "room.updaterooms": {
                sendToClient(ws, "room.updaterooms", {rooms: ROOMS});
                break;
            }
            case "room.join": {
                var room = getRoomFromID(args.roomID);
                var playerOj = getClientObjectFromConnection(ws).player;

                if(room.viewers.indexOf(playerOj) == -1) room.viewers.push(playerOj);
                sendToClient(ws, "room.join", {room: room})
                sendToRoom(room, "room.onjoin", {room: room})
                break;
            }
            case "room.squareselected":
                var room = getRoomFromID(args.roomID);

                room.gameBoard[args.square] = 1;

                sendToClient(ws, "room.squareselected", {room: room})
                break;
            case "room.leave": {
                var room = getRoomFromID(args.roomID);

                room.viewers = room.viewers.filter((viewer) => viewer.id != getIDFromConnection(ws))

                sendToClient(ws, "room.leave", {room: room});
                sendToRoom(room, "room.onleave", {room: room})
                break;
            }
            default:
                break;
        }
    });
    
    ws.addEventListener('close', (event) => {
        var playerID = getIDFromConnection(event.target);
        var room = getPlayersRoom(playerID);

        if(room != null) {
            room.viewers = room.viewers.filter((viewer) => viewer.id != playerID)
            sendToRoom(room, "room.onleave", {room: room})
        }
    })
});

/*
    We want to structure room like 

    {
        roomID: -1
        owner: {_ultron.id} - for tracking
        state: waiting|started
        playersGo: {_ultron.id}
        gameBoard: [] - filled with 9 0's
        viewers: {[_ultron.id]} - people viewing the game
    }
*/

server.listen(port, function() {
    console.log("Web Socket Server started on port " + port);
});

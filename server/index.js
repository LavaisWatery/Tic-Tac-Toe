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
            return; // TODO make sure this works
        }
    });
    return nick;
}

function getConnectionFromID(id) {
    var sock = null;

    CONNECTED_CLIENTS.forEach(client => {
        if(id == client.connectionID) {
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

function sendToRoom(room, method, args) {
    room.forEach((viewer) => {
        sendToClient(viewer, method, args);
    });
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
                CONNECTED_CLIENTS.push({nickname: args.nickname, color: args.color, connectionID: ws._ultron.id, ws: ws})
                sendToClient(ws, "login", args);
                break;
            case "logout":
                sendToClient(ws, "logout");
                break;
            case "room.create":
                nick = getNicknameFromConnection(ws);
                ROOMS.push(room = {roomID: ROOMS_NUM, gameBoard: new Array(9).fill(0), owner: getIDFromConnection(ws), ownerName: getNicknameFromConnection(ws), state: "waiting", playersGo: null, viewers: []});
                ROOMS_NUM++;
                room.viewers = [];
                room.viewers.push(getIDFromConnection(ws))
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
                var room = getRoomFromID(args.roomID);
                var id = getIDFromConnection(ws);

                if(room.viewers.indexOf(id) == -1) room.viewers.push(id);
                sendToClient(ws, "room.join", {room: getRoomFromID(args.roomID)})
                break;
            }
            case "room.squareselected":
                var room = getRoomFromID(args.roomID);

                room.gameBoard[args.square] = 1;

                sendToClient(ws, "room.squareselected", {room: room})
                break;
            case "room.leave": {
                var room = getRoomFromID(args.roomID);
                var oldViewers = room.viewers.map((viewer) => getConnectionFromID(viewer));

                room.viewers = room.viewers.filter((viewer) => viewer != getIDFromConnection(ws))
                sendToClient(ws, "room.leave", {room: room});
                break;
            }
            default:
                break;
        }
    });
    
    ws.addEventListener('close', (event) => {
        console.log("target closed connection");
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

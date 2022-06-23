var _ = require('lodash');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 4949;
const server = http.createServer(express);
const wss = new WebSocket.Server({ server });

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
        if (id == client.id) {
            nick = client.nickname;
            return;
        }
    });
    return nick;
}

function getConnectionFromID(id) {
    var sock = null;

    CONNECTED_CLIENTS.forEach(client => {
        if (id == client.id) {
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
        if (item.roomID == id) {
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
        if (id == client.id) {
            oj = client;
            return;
        }
    })

    return oj;
}

function sendToRoom(room, method, args) {
    room.viewers.forEach((viewer) => {
        conn = getConnectionFromID(viewer.id);
        if (conn != null) sendToClient(conn, method, args);
    });

    var ownerConnection = getConnectionFromID(room.owner.id);
    if (ownerConnection != null) sendToClient(ownerConnection, method, args);
    if (room.opponent != null) {
        var opponentConnection = getConnectionFromID(room.opponent.id);
        if (opponentConnection != null) sendToClient(opponentConnection, method, args);
    }
}

function sendToRoomExcept(except, room, method, args) {
    room.viewers.forEach((viewer) => {
        conn = getConnectionFromID(viewer.id);
        if (conn != except) {
            if (conn != null) sendToClient(conn, method, args);
        }
    });

    if (room.owner.id != except) {
        var ownerConnection = getConnectionFromID(room.owner.id);
        if (ownerConnection != null) sendToClient(ownerConnection, method, args);
    }
    if (room.opponent != null && room.opponent.id != except) {
        var opponentConnection = getConnectionFromID(room.opponent.id);
        if (opponentConnection != null) sendToClient(opponentConnection, method, args);
    }
}

function doesRoomContainViewerWithID(room, id) {
    var viewer = null;

    room.viewers.forEach((v) => {
        if (v.id == id) {
            viewer = v;
            return;
        }
    })

    return viewer;
}

function getPlayersRoom(playerID) {
    var room = null;

    ROOMS.forEach(ruum => {
        if (doesRoomContainViewerWithID(ruum, playerID) != null) {
            room = ruum;
            return;
        }
    })

    return room;
}

/*
    Game functions
*/

function isPlaying(room, playerID) {
    if (room.owner.id == playerID | room.opponent.id == playerID) return true;

    return false;
}

function getCharacter(room, playerID) {
    if (isPlaying(room, playerID)) {
        return room.owner.id == playerID ? 1 : 2;
    }

    return -1;
}

function pushMessageToRoom(room, playerObject, message) {
    room.logs.push({ id: room.logs.length, player: playerObject, message: message });
    sendToRoom(room, "room.message", { logs: room.logs }); // don't think I need this but \o/
}

function getNextGo(room) {
    if(room.playersGo != null) {
        return _.isEqual(room.playersGo, room.owner) ? room.opponent : room.owner;
    }

    return room.owner;
}

wss.on('connection', function connection(ws) {
    // Set on message
    ws.on('message', function incoming(data) {
        const receieved = JSON.parse(data.toString());
        const method = receieved.method;
        const args = receieved.args;

        console.log(`args: `, args)

        switch (receieved.method) {
            // Recieve from client {login} - This creates a client object with stuffs
            case "login":
                var arg = { nickname: args.nickname, color: args.color, id: ws._ultron.id };
                CONNECTED_CLIENTS.push({ player: arg, id: ws._ultron.id, ws: ws })
                sendToClient(ws, "login", arg);
                break;
            // Recieve from client {logout} - Clear from viewers if room exists, sends to player "logout", this if room exists send the updated room to everyone in room
            case "logout":
                var room = getPlayersRoom(getIDFromConnection(ws));

                sendToClient(ws, "logout");

                if (room != null) {
                    room.viewers = room.viewers.filter((viewer) => viewer.id != getIDFromConnection(ws))
                    sendToRoom(room, "room.onleave", { room: room })
                }

                break;
            // Recieve room.create from player creating room, push new room with roomID, owner, opponent, state, playersGo, viewers, then send new room to player, send ROOMS to all clients
            case "room.create":
                nick = getNicknameFromConnection(ws);

                ROOMS.push(room = { roomID: ROOMS_NUM, gameBoard: new Array(9).fill(0), owner: getClientObjectFromConnection(ws).player, opponent: null, state: "waiting", playersGo: null, viewers: [], logs: [] });
                ROOMS_NUM++;

                sendToClient(ws, "room.create", { room: room });

                wss.clients.forEach(client => {
                    sendToClient(client, "room.oncreate", { rooms: ROOMS });
                })

                break;
            case "room.challenge": {
                var room = getRoomFromID(args.roomID);

                if (room == null) return;

                if (room.state == 'waiting') {
                    room.state = 'playing';
                    room.opponent = getClientObjectFromConnection(ws).player;
                    room.playersGo = room.owner;
                    room.viewers = room.viewers.filter((viewer) => viewer.id != getIDFromConnection(ws));

                    sendToRoom(room, "room.challenge", { room: room });
                    pushMessageToRoom(room, getClientObjectFromConnection(ws).player, "It is now " + room.playersGo.nickname + "'s turn!")
                }
                else { }

                break;
            }
            // Just updates room for player
            case "room.updaterooms": {
                sendToClient(ws, "room.updaterooms", { rooms: ROOMS });
                break;
            }
            // When a player clicks join, get room from arg data, add to viewers then send to clients
            case "room.join": {
                var room = getRoomFromID(args.roomID);
                var playerOj = getClientObjectFromConnection(ws).player;

                if (room == null) return;
                if (room.viewers.indexOf(playerOj) == -1) room.viewers.push(playerOj);

                sendToClient(ws, "room.join", { room: room })
                sendToRoom(room, "room.onjoin", { room: room })
                break;
            }
            // When a square is selected, send event to every client in room
            case "room.squareselected":
                var room = getRoomFromID(args.roomID);
                var id = getIDFromConnection(ws);

                room.gameBoard[args.square] = getCharacter(room, id);
                room.playersGo = getNextGo(room);

                sendToRoom(room, "room.squareselected", { room: room })
                pushMessageToRoom(room, getClientObjectFromConnection(ws).player, "It is now " + room.playersGo.nickname + "'s turn!")
                break;
            case "room.leave": {
                var room = getRoomFromID(args.roomID);

                if (room.owner.id == ws._ultron.id) { // Owner leaves
                    var roomIndex = ROOMS.indexOf(room);
                    ROOMS.splice(roomIndex, 1);
                    sendToRoom(room, "room.leave", { rooms: ROOMS, roomID: room.roomID });

                    return;
                }

                room.viewers = room.viewers.filter((viewer) => viewer.id != getIDFromConnection(ws))

                sendToClient(ws, "room.leave", { rooms: ROOMS, roomID: room.roomID });
                sendToRoomExcept(ws._ultron.id, room, "room.onleave", { room: room })
                break;
            }
            default:
                break;
        }
    });

    ws.addEventListener('close', (event) => {
        var playerID = getIDFromConnection(event.target);
        var room = getPlayersRoom(playerID);
        var clientObject = getClientObjectFromConnection(event.target);
        var clientIndex = CONNECTED_CLIENTS.indexOf(clientObject);

        CONNECTED_CLIENTS.splice(clientIndex, 1);

        if (room != null) {
            room.viewers = room.viewers.filter((viewer) => viewer.id != playerID)
            sendToRoom(room, "room.onleave", { room: room })
        }
    })
});

/*
    We want to structure room like 

    { _ROOMS
        roomID: -1
        owner: {_ultron.id} - for tracking
        state: waiting|started
        playersGo: {_ultron.id}
        gameBoard: [] - filled with 9 0's
        viewers: {[_ultron.id]} - people viewing the game
    }

    { _LOG
        message: ""
        player: playerObject
    }

*/

server.listen(port, function () {
    console.log("Web Socket Server started on port " + port);
});

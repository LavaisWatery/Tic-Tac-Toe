const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const port = 4949;
const server = http.createServer(express);
const wss = new WebSocket.Server({server});

const CONNECTED_CLIENTS = [];
const ROOMS = [];

function sendToClient(client, method, args) {
    client.send(JSON.stringify({ type: "request", method, args }));
}

wss.on('connection', function connection(ws) {
    // Set on message
    console.log("connected " + ws.toString());
    ws.on('message', function incoming(data) {
        const receieved = JSON.parse(data.toString());
        const method = receieved.method;
        const args = receieved.args;

        switch(receieved.method) {
            case "login":
                CONNECTED_CLIENTS.push({player: args.nickname, ws})
                console.log(CONNECTED_CLIENTS);
                sendToClient(ws, "login", args);
                break;
            case "logout":
                sendToClient(ws, "logout");
                break;
            case "room.oncreate":
                sendToClient(ws, "room.oncreate")
                break;
            default:
                break;
        }
    });
});

server.listen(port, function() {
    console.log("Web Socket Server started on port " + port);
});

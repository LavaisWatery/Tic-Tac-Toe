import {useEffect, useState} from "react";
import onClickMethods from "../lib/events/on-click-methods";
import send from "../lib/server/send";

const ws_url = "ws://192.168.0.16:4949";

const useInitWebSocket = () => {
    // states
    const [player, setPlayer] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState(null);

    const [webSocket, setWebSocket] = useState(null);

    useEffect(function initWebSocket() {
        if(webSocket != null) return;
        const newWebSocket = new WebSocket(ws_url);

        newWebSocket.onmessage = (event) => {
            console.log(`[🧶] MESSAGE`, event.data);

            const data = JSON.parse(event.data);
            const { method, args } = data;

            switch(method) {
                case "login": {
                    setPlayer(args);
                    send(newWebSocket, "room.updaterooms");
                    break;
                }
                case "logout": {
                    setPlayer(null);
                    setRoom(null);
                    setRooms([]);
                    break;
                }
                // When parent player creates room
                case "room.create": {
                    setRoom(args.room);
                    break;
                }
                case "room.oncreate":
                case "room.updaterooms": 
                    setRooms(args.rooms);
                    break;
                case "room.join":
                    setRoom(args.room);
                    break;
                case "room.leave": {
                    setRoom(null);
                    break;
                }
                case "room.squareselected":
                    setRoom(args.room);
                    break;
                default:
                    break;
            }
        };

        newWebSocket.onerror = (event) => {
            console.log(`[🔥] ERROR :\n`, event);
        };

        newWebSocket.onopen = (event) => {
            console.log("[🎉] OPEN :\n", event);
        };

        newWebSocket.onclose = (event) => {
            console.log(`[🧨] CLOSE :\n`, event);
        };

        setWebSocket(newWebSocket);
        console.log("Set Web Socket to " + newWebSocket);
    }, []);

    // Set consts for react handle
    const onClick = {
        onSignIn: (event) => onClickMethods.onSignIn(event, webSocket),
        onSignOut: (event) => onClickMethods.onSignOut(event, webSocket),
        onCreate: (event) => onClickMethods.onCreate(event, webSocket),
        onJoin: (event) => onClickMethods.onJoin(event, webSocket),
        onLeave: (event) => onClickMethods.onLeave(event, webSocket),
        onSquareSelected: (event) => {
            if (room.state == 'waiting') return;
            
            onClickMethods.onSquareSelected(event, webSocket)
        }
    }

    return {player, rooms, room, onClick}; 
}

export default useInitWebSocket;
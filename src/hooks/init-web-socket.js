import {useEffect, useState} from "react";
import onClickMethods from "../lib/events/on-click-methods";

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
                    console.log("Recieved login ");
                    break;
                }
                case "logout": {
                    setPlayer(null);
                    break;
                }
                // When parent player creates room
                case "room.oncreate": {
                    setRoom({});
                    break;
                }
                default:
                    break;
            }
        }

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
    }

    return {player, rooms, room, onClick}; 
}

export default useInitWebSocket;
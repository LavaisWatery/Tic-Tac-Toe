import send from "../server/send";

function onSignOut(event, webSocket) {
    send(webSocket, "logout");
}

function onSignIn(event, webSocket) {
    event.preventDefault(); // Prevent actual request sent to site
    const nickname = event.target.nickname.value;
    const color = event.target.color.value;
    
    if (nickname.length >= 1 && nickname.length <= 32) {
        send(webSocket, "login", { nickname, color });
    }
}

function onCreate(event, webSocket) {
    send(webSocket, "room.create");
}

function onJoin(event, webSocket) {
    send(webSocket, "room.join", { roomID: event.roomID})
}

function onSquareSelected(event, webSocket) {
    send(webSocket, "room.squareselected");
    console.log("test");
}

const onClickMethods = {
    onSignIn,
    onSignOut,
    onCreate,
    onJoin,
    onSquareSelected,
};

export default onClickMethods;
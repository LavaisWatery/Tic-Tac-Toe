import styles from "./Room.module.scss";
import Game from "../Game/Game";
import Users from "../Users/Users";
import Console from "../Console/Console";

const Room = ({room, logs, player, onClick}) => {
    return (
        <div className={styles.root}>
            <Game room={room} player={player} onClick={onClick}/>
            <div className={styles.usersRoot}>
                <Users room={room}/>
                <Console logs={logs} />
            </div>
        </div>
    );
}

export default Room;
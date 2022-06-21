import styles from "./Room.module.scss";
import Game from "../Game/Game";
import Users from "../Users/Users";

const Room = ({room, player, onClick}) => {
    return (
        <div className={styles.root}>
            <Game room={room} player={player} onClick={onClick}/>
            <div className={styles.usersRoot}>
                <Users room={room}/>
            </div>
        </div>
    );
}

export default Room;
import styles from "./Room.module.scss";
import Game from "../Game/Game";

const Room = ({player, onSquareSelected}) => {

    return (
        <div className={styles.root}>
            <Game player={player} onSquareSelected={onSquareSelected}/>
        </div>
    );
}

export default Room;
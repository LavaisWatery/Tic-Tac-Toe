import styles from "./Game.module.scss";
import GameGrid from "../GameGrid/GameGrid";
import RoomToolBar from "../RoomToolBar/RoomToolBar";

const Game = ({room, player, onClick}) => {
    
    return (
        <div className={styles.root}>
            <RoomToolBar onClick={onClick} room={room} player={player}/>
            <div className={styles.base}>
                <GameGrid room={room} player={player} onClick={onClick}/>
            </div>
        </div>
    );
}

export default Game;
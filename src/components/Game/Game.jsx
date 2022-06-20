import styles from "./Game.module.scss";
import GameGrid from "../GameGrid/GameGrid";

const Game = ({player, onSquareSelected}) => {
    
    return (
        <div className={styles.root}>
            <div className={styles.base}>
                <GameGrid player={player} onSquareSelected={onSquareSelected}/>
            </div>
        </div>
    );
}

export default Game;
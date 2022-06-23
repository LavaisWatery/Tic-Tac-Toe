import { useEffect } from "react";
import styles from "./GameGrid.module.scss";

const GameGrid = ({props, room, player, onClick}) => { 

    return (
        <div className={styles.row}>
            {
            room.gameBoard.map((key, index) => {
                return (
                    <div className={styles.square} onClick={() => onClick.onSquareSelected({roomID: room.roomID, squareIndex: index})} key={index}>
                        <div className={styles.squareText}>
                            {key == 0 ? "" : key == 1 ? "X" : "O"}
                        </div> 
                    </div>
                )
            })}
        </div>
    );
}

export default GameGrid;
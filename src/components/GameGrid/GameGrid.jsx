import styles from "./GameGrid.module.scss";

const GameGrid = ({props, player, onSquareSelected}) => {
    var elements = [];

    for(var i = 0; i < 9; i++) {
        elements.push(
            <button className={styles.square} onClick={() => onSquareSelected({i})} key={i}>
                <div className={styles.squareText}>▩</div>
            </button>
        )
    }

    return (
        <div className={styles.row}>
            {elements}
        </div>
    );
}

export default GameGrid;
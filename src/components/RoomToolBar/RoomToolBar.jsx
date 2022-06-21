import styles from "./RoomToolBar.module.scss";

const RoomToolBar = ({room, player, onClick}) => {

    return (
        <header className={styles.root}>
            <div className={styles.base}>

                <button className="small red" onClick={() => onClick.onLeave({roomID: room.roomID})}>
                    Leave room
                </button>
            </div>
        </header>
    );
}

export default RoomToolBar;
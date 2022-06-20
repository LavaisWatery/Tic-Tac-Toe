import styles from "./Rooms.module.scss";

const Rooms = ({rooms, onCreate}) => {
    return (
        <div className={styles.root}>
            <p>
                Choose a room to play in,
                <br />
                or create your own.
            </p>

            

            <button className="purple" onClick={onCreate}>
                Create room
            </button>
        </div>
    );
}

export default Rooms;
import styles from "./Rooms.module.scss";

const Rooms = ({rooms, onCreate, onJoin}) => {
    var roomElements = [];
    rooms.forEach((room) => {
        roomElements.push(
            <div className={styles.base} key={room.roomID}>
                <b style={{color: room.owner.color}}>{room.owner.nickname}'s Room</b>
                <button
                    className="outline purple small"
                    onClick={() => onJoin({roomID: room.roomID})}
                >
                    Join
                </button>
            </div>
        )
    })

    return (
        <div className={styles.root}>
            <p>
                Choose a room to play in,
                <br />
                or create your own.
            </p>
            
            {roomElements}

            <button className="purple" onClick={onCreate}>
                Create room
            </button>
        </div>
    );
}

export default Rooms;
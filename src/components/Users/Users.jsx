import styles from "./Users.module.scss";

const Users = ({room}) => {
    
    return (
        <div className={styles.root}>
            <div>
                <div>Owner</div>
                <div>
                    <b style={{color: room.owner.color}}>
                        {room.owner.nickname}
                    </b>
                </div>
            </div>
            {room.opponent && (
                <div>
                    <div>Opponent</div>
                    <div>
                        <b style={{color: room.opponent.color}}>
                            {room.opponent.nickname}
                        </b>
                    </div>
                </div>
            )}
            <div>
                <div>Viewers</div>
                {room.viewers.map(viewer => (
                    <div key={viewer.id}>
                        <b style={{color: viewer.color}}>
                            {viewer.nickname}
                        </b>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;
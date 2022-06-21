import styles from "./Users.module.scss";

const Users = ({room}) => {
    
    return (
        <div className={styles.root}>
            <div>
                <div>Owner</div>
                <div>
                    <b>
                        {room.owner.nickname}
                    </b>
                </div>
            </div>
            <div>
                <div>Viewers</div>
                {room.viewers.map(viewer => (
                    <div key={viewer.id}>
                        <b>
                            {viewer.nickname}
                        </b>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;
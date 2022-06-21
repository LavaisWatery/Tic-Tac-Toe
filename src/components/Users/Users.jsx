import styles from "./Users.module.scss";

const Users = ({room}) => {
    
    return (
        <div className={styles.root}>
            <div>
                <div>Owner</div>
                <div>
                    <b>
                        {room.ownerName}
                    </b>
                </div>
            </div>
        </div>
    );
}

export default Users;
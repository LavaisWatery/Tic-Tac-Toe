import './App.css';
import styles from "./App.module.scss";
import useInitWebSocket from "./hooks/init-web-socket";
import Header from "./components/Header/Header";
import SignIn from './components/SignIn/SignIn';
import Rooms from "./components/Rooms/Rooms";
import Room from "./components/Room/Room"

function App() {
  const { player, rooms, room, onClick } = useInitWebSocket(); // Custom react handle learnt from @ljtechdotca

  return (
    <div className={styles.root}>
      <Header player={player} onSignOut={onClick.onSignOut} />
      <main>
        {!player && <SignIn onClick={onClick.onSignIn} />}
        {player && !room && <Rooms rooms={rooms} onCreate={onClick.onCreate} onJoin={onClick.onJoin} />}
        {player && room && <Room player={player} onSquareSelected={onClick.onSquareSelected} />}
      </main>
    </div>
  );
}

export default App;

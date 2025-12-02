import SearchBox from "./components/SearchBox";
import './App.css';
import portadaImg from './assets/beho9lder1.png';

function App() {
  return (
    <div className="app">
      <div className="header">
        <h1>Beholder</h1>
        <img src={portadaImg} alt="Logo Beholder" className="logo-right" />
      </div>

      <h2>Diagnóstico centralizado de 2F Internet</h2>
      <SearchBox />
    </div>
  );
}

export default App;
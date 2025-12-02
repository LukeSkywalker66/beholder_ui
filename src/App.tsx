import SearchBox from "./components/SearchBox";
import './App.css';

// Importá la imagen transparente
import portadaImg from './assets/beholder2.png';

function App() {
  return (
    <div className="app">
      {/* Imagen arriba */}
      <img src={portadaImg} alt="Logo Beholder" className="logo" />

      <h1>Beholder</h1>
      <h2>Diagnóstico centralizado de 2F Internet</h2>

      <SearchBox />
    </div>
  );
}

export default App;
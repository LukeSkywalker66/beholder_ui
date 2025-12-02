import SearchBox from "./components/SearchBox";
import './App.css';

// Importá la imagen desde assets
import portadaImg from './assets/beholder1.png';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Beholder</h1>
        <h2>Diagnóstico centralizado de 2F Internet</h2>
      </header>

      {/* Imagen de portada */}
      <div className="portada">
        <img src={portadaImg} alt="Portada Beholder" className="portada-img" />
      </div>

      <main>
        <SearchBox />
      </main>
    </div>
  );
}

export default App;
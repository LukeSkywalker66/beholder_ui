import { useState } from "react";

// Interfaz para los resultados de la búsqueda
interface SearchResult {
  pppoe: string;
  nombre: string;
  direccion: string;
  id: number;
  origen: string; // 'ispcube' o 'smartolt'
}

export default function SearchBox({ onResult }: { onResult: (data: any) => void }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Buscar candidatos mientras escribís o das Enter
  const handleSearchCandidates = async () => {
    if (query.length < 3) return;
    setLoading(true);
    setError(null);
    setCandidates([]);
    onResult(null); 

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(query)}`,
        {
          headers: { "x-api-key": import.meta.env.VITE_API_KEY },
        }
      );
      if (!resp.ok) throw new Error("Error buscando clientes");
      
      const data = await resp.json();
      
      if (data.length === 0) {
        setError("No se encontraron coincidencias. Intente con el PPPoE exacto.");
        // Opcional: Podrías disparar executeDiagnosis(query) aquí si querés forzar.
      } else {
        setCandidates(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ejecutar Diagnóstico Final (al elegir un cliente de la lista)
  const executeDiagnosis = async (pppoeUser: string) => {
    setLoading(true);
    setCandidates([]); // Limpiamos la lista
    setError(null);
    setQuery(pppoeUser); // Ponemos el PPPoE en el input

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/diagnosis/${pppoeUser}`,
        {
          headers: { "x-api-key": import.meta.env.VITE_API_KEY },
        }
      );
      if (!resp.ok) throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      const json = await resp.json();
      onResult(json);
    } catch (err: any) {
      setError(err.message);
      onResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 relative w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchCandidates()}
          placeholder="Nombre, Dir, DNI o PPPoE..."
          className="border border-gray-300 px-3 py-2 flex-grow rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
        />
        <button
          onClick={handleSearchCandidates}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}

      {/* Lista flotante de resultados */}
      {candidates.length > 0 && (
        <ul className="absolute z-20 w-full left-0 mt-2 bg-white text-black border border-gray-200 rounded-md shadow-xl max-h-64 overflow-y-auto">
          {candidates.map((c) => (
            <li
              key={c.pppoe}
              onClick={() => executeDiagnosis(c.pppoe)}
              className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
            >
              <div>
                <div className="font-bold text-gray-800">{c.nombre}</div>
                <div className="text-sm text-gray-500">
                  {c.direccion}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  {c.pppoe}
                </span>
                {c.origen === 'smartolt' && (
                  <span className="text-[10px] text-orange-500 font-semibold">Solo Técnico</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
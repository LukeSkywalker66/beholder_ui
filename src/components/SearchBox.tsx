import { useState } from "react";

interface SearchResult {
  pppoe: string;
  nombre: string;
  direccion: string;
  origen: string;
}

export default function SearchBox({ onResult }: { onResult: (data: any) => void }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); 

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setCandidates([]);
    onResult(null); 
    setStatusMsg("🔍 Escaneando padrón...");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/search?q=${query}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const results: SearchResult[] = await resp.json();

      if (results.length === 0) {
        setError("No se encontraron clientes.");
        setStatusMsg("");
      } else if (results.length === 1) {
        setStatusMsg("🎯 Resultado único. Obteniendo diagnóstico...");
        await fetchDiagnosis(results[0].pppoe);
      } else {
        setCandidates(results);
        setStatusMsg(`✅ ${results.length} coincidencias:`);
      }
    } catch (err: any) {
      setError("Error de conexión.");
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosis = async (pppoe: string) => {
    setLoading(true);
    setCandidates([]); 
    setStatusMsg(`📡 Diagnosticando ${pppoe}...`);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/diagnosis/${pppoe}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );
      if (!resp.ok) throw new Error("Fallo en diagnóstico");
      onResult(await resp.json());
      setStatusMsg(""); 
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-2xl mx-auto">
      {/* Buscador */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(null);
            if (statusMsg) setStatusMsg("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Nombre, Dirección, DNI o Usuario..."
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </div>

      {/* Mensajes de Estado */}
      <div className="mt-3 min-h-[24px] text-center sm:text-left">
        {loading && <p className="text-blue-600 font-medium animate-pulse">{statusMsg}</p>}
        {!loading && statusMsg && candidates.length > 0 && <p className="text-gray-500 text-sm">{statusMsg}</p>}
        {error && <p className="text-red-500 font-bold bg-red-50 p-2 rounded border border-red-200 inline-block">❌ {error}</p>}
      </div>

      {/* Lista de Resultados (Minimalista) */}
      {candidates.length > 0 && (
        <ul className="mt-4 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden divide-y divide-gray-100">
          {candidates.map((c) => (
            <li
              key={c.pppoe}
              onClick={() => fetchDiagnosis(c.pppoe)}
              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group text-left"
            >
              {/* Solo datos esenciales */}
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 group-hover:text-blue-700 text-lg">
                  👉 {c.nombre}
                </span>
                
                <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-4">
                  <span className="flex items-center gap-1">
                    👤 <code className="bg-gray-100 px-1 rounded text-gray-700 font-mono">{c.pppoe}</code>
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    📍 {c.direccion}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
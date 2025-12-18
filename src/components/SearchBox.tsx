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
    setStatusMsg("🔍 Escaneando...");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/search?q=${query}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const results: SearchResult[] = await resp.json();

      if (results.length === 0) {
        setError("No encontrado.");
        setStatusMsg("");
      } else if (results.length === 1) {
        setStatusMsg("🎯 Único. Diagnosticando...");
        await fetchDiagnosis(results[0].pppoe);
      } else {
        setCandidates(results);
        setStatusMsg(`✅ ${results.length} encontrados:`);
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
      if (!resp.ok) throw new Error("Fallo");
      onResult(await resp.json());
      setStatusMsg(""); 
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Buscador: Diseño Vertical para Sidebar */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(null);
            if (statusMsg) setStatusMsg("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Buscar cliente..."
          className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow transition-all disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* Mensajes de Estado */}
      <div className="mt-2 min-h-[20px]">
        {loading && <p className="text-blue-600 font-medium text-sm animate-pulse">{statusMsg}</p>}
        {!loading && statusMsg && candidates.length > 0 && <p className="text-gray-500 text-xs">{statusMsg}</p>}
        {error && <p className="text-red-500 font-bold text-sm">❌ {error}</p>}
      </div>

      {/* Lista de Resultados Compacta */}
      {candidates.length > 0 && (
        <ul className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {candidates.map((c) => (
            <li
              key={c.pppoe}
              onClick={() => fetchDiagnosis(c.pppoe)}
              className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group text-left"
            >
              <div className="flex flex-col">
                {/* Nombre: Que baje de línea si es largo */}
                <span className="font-bold text-gray-800 group-hover:text-blue-700 text-sm leading-tight mb-1 break-words">
                  {c.nombre}
                </span>
                
                {/* Detalles verticales siempre */}
                <div className="text-xs text-gray-500 flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    👤 <code className="bg-gray-100 px-1 rounded text-gray-700 font-mono text-xs">{c.pppoe}</code>
                  </span>
                  {/* Dirección: Permitir wrap (sin truncate) */}
                  <span className="flex items-start gap-1">
                    <span className="shrink-0">📍</span>
                    <span className="break-words leading-tight">{c.direccion}</span>
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
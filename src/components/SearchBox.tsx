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
    setStatusMsg("🔍 Buscando en la base de datos...");

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
        setStatusMsg("🎯 Cliente único. Cargando diagnóstico...");
        await fetchDiagnosis(results[0].pppoe);
      } else {
        setCandidates(results);
        setStatusMsg(`✅ Se encontraron ${results.length} coincidencias:`);
      }
    } catch (err: any) {
      setError("Error de conexión con el servidor.");
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosis = async (pppoe: string) => {
    setLoading(true);
    setCandidates([]); 
    setStatusMsg(`📡 Analizando conexión de ${pppoe}...`);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/diagnosis/${pppoe}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );
      if (!resp.ok) throw new Error("Fallo al obtener diagnóstico");
      
      const data = await resp.json();
      // Inyectamos el usuario original para que OutputBox lo muestre siempre
      onResult({ ...data, pppoe_original: pppoe });
      
      setStatusMsg(""); 
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Input y Botón */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError(null);
              if (statusMsg) setStatusMsg("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            // Placeholder descriptivo como pediste
            placeholder="Nombre, Dirección, DNI o Usuario..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700 bg-white"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar Cliente"}
        </button>
      </div>

      {/* Mensajes de Estado */}
      <div className="mb-3 min-h-[20px]">
        {loading && <p className="text-blue-600 font-medium text-sm animate-pulse">{statusMsg}</p>}
        {!loading && statusMsg && candidates.length > 0 && <p className="text-green-600 font-medium text-sm">{statusMsg}</p>}
        {error && <div className="bg-red-50 text-red-600 p-2 rounded border border-red-200 text-sm">❌ {error}</div>}
      </div>

      {/* Lista de Resultados (Tarjetas Modernas) */}
      {candidates.length > 0 && (
        <ul className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 pb-2">
          {candidates.map((c, i) => (
            <li
              // Usamos índice para permitir duplicados (mismo usuario en dif nodos)
              key={`${c.pppoe}-${i}`} 
              onClick={() => fetchDiagnosis(c.pppoe)}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group text-left relative overflow-hidden"
            >
              {/* Decoración lateral */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.origen === 'ispcube' ? 'bg-blue-500' : 'bg-orange-400'}`}></div>

              <div className="pl-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-800 group-hover:text-blue-700 text-sm uppercase leading-tight">
                    {c.nombre}
                  </span>
                  {/* Badge sutil */}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${c.origen === 'ispcube' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {c.origen === 'ispcube' ? 'CLIENTE' : 'INFRA'}
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span title="Usuario PPPoE">👤</span>
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono font-bold">
                      {c.pppoe}
                    </code>
                  </div>
                  
                  <div className="flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5" title="Dirección">📍</span>
                    <span className="leading-snug">
                      {c.direccion || <i className="text-gray-400">Sin dirección registrada</i>}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
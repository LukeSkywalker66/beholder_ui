import { useState } from "react";

// Definimos la interfaz para los resultados de búsqueda "livianos"
interface SearchResult {
  pppoe: string;
  nombre: string;
  direccion: string;
  origen: string; // 'ispcube', 'mikrotik', 'smartolt'
}

export default function SearchBox({ onResult }: { onResult: (data: any) => void }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); // Mensaje de estado (ej: "Buscando...")

  // Paso 1: Buscar coincidencias (Search)
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setCandidates([]);
    onResult(null); // Limpiar resultado anterior
    setStatusMsg("🔍 Escaneando padrón...");

    try {
      // Ajusta la URL al endpoint que creamos en Python (db.search_client)
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/search?q=${query}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      
      const results: SearchResult[] = await resp.json();

      if (results.length === 0) {
        setError("No se encontraron clientes con ese criterio.");
        setStatusMsg("");
      } else if (results.length === 1) {
        // ✨ AUTOSELECCIÓN: Si es único, vamos directo al diagnóstico
        setStatusMsg("🎯 Resultado único encontrado. Obteniendo diagnóstico...");
        await fetchDiagnosis(results[0].pppoe);
      } else {
        // Múltiples resultados: Mostrar lista
        setCandidates(results);
        setStatusMsg(`✅ Se encontraron ${results.length} coincidencias. Seleccione una:`);
      }

    } catch (err: any) {
      setError("Error de conexión con el servidor.");
      console.error(err);
    } finally {
      // Solo quitamos loading si NO estamos en autoselección (para que no parpadee)
      // En este caso simple, lo manejamos dentro de fetchDiagnosis o al final
      if (candidates.length > 0 || error) setLoading(false);
    }
  };

  // Paso 2: Obtener diagnóstico técnico (Diagnosis)
  const fetchDiagnosis = async (pppoe: string) => {
    setLoading(true);
    setCandidates([]); // Limpiamos la lista para limpiar visualmente
    setStatusMsg(`📡 Interrogando equipos para ${pppoe}...`);
    
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/diagnosis/${pppoe}`,
        { headers: { "x-api-key": import.meta.env.VITE_API_KEY } }
      );
      
      if (!resp.ok) throw new Error("Fallo en diagnóstico");
      
      const json = await resp.json();
      onResult(json); // Enviamos la data final al OutputBox
      setStatusMsg(""); 
    } catch (err: any) {
      setError(`Error al diagnosticar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Nombre, Dirección, DNI o Usuario..."
          className="border px-3 py-2 rounded w-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </div>

      {/* Área de Estado / Carga */}
      <div className="mt-3 min-h-[24px]">
        {loading && <p className="text-blue-600 font-medium animate-pulse">{statusMsg}</p>}
        {!loading && statusMsg && candidates.length > 0 && <p className="text-gray-600 text-sm">{statusMsg}</p>}
        {error && <p className="text-red-600 font-bold">❌ {error}</p>}
      </div>

      {/* Lista de Candidatos (Mejorada) */}
      {candidates.length > 0 && (
        <ul className="candidate-list mt-2 border rounded-md shadow-lg bg-white overflow-hidden max-h-[400px] overflow-y-auto">
          {candidates.map((c) => (
            <li
              key={c.pppoe}
              onClick={() => fetchDiagnosis(c.pppoe)}
              className="candidate-item border-b last:border-0 p-3 hover:bg-blue-50 cursor-pointer transition-colors text-left group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 group-hover:text-blue-700">
                  👉 {c.nombre}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${c.origen === 'ispcube' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {c.origen === 'ispcube' ? 'Cliente' : 'Técnico'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mt-1 pl-6">
                <p>👤 <span className="font-mono">{c.pppoe}</span></p>
                <p>📍 {c.direccion}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import { useState } from "react";
import OutputBox from "./OutputBox";

export default function SearchBox() {
  const [pppoe, setPppoe] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/diagnosis/${pppoe}`,
        {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY,
          },
        }
      );

      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }

      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={pppoe}
        onChange={(e) => setPppoe(e.target.value)}
        placeholder="Ingrese PPPoE"
        className="border px-2 py-1 mr-2"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Buscar
      </button>

      {loading && <p>Buscando...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {data && <OutputBox data={data} />}

    </div>
  );
}
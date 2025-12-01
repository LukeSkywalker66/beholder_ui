import React from "react";
import CopyButton from "./CopyButton";

interface OutputBoxProps {
  data: any;
}

export default function OutputBox({ data }: OutputBoxProps) {
  const traducciones: Record<string, string> = {
    Online: "En línea",
    "Power fail": "Problema de energía",
    LOS: "Sin señal/sin luz",
    Offline: "Fuera de línea",
    true: "Conectado",
    false: "Desconectado",
    Critical: "Crítico - Luz muy alta",
    Warning: "Advertencia - Luz alta",
    "Very good": "Muy buena - Luz óptima",
  };

  // Texto plano para copiar
  const outputText = `
Cliente: ${data?.mikrotik?.comment ?? "-"}
Domicilio: ${data?.direccion ?? "-"}
Plan: ${data?.plan ?? "-"}
Nodo: ${data?.nodo_nombre ? data.nodo_nombre + " - " + (data?.nodo_ip ?? "-") : "-"}
OLT: ${data?.OLT ?? "-"}
PPPoE User: ${data?.pppoe_username ?? "-"}
Estado PPPoE: ${traducciones[data?.mikrotik?.active] ?? "-"}
Tiempo activo: ${data?.mikrotik?.uptime ?? "-"}
Última conexión: ${data?.mikrotik?.secret?.["last-logged-out"] ?? "-"}
ONU s/n: ${data?.onu_sn ?? "-"}
ONU Estado: ${traducciones[data?.onu_status_smrt?.onu_status] ?? "-"}
ONU Último cambio de estado: ${data?.onu_status_smrt?.last_status_change ?? "-"}
ONU Señal: ${traducciones[data?.onu_signal_smrt?.onu_signal] ?? "-"}
ONU Señal Detalle: ${data?.onu_signal_smrt?.onu_signal_value ?? "-"}
`;

  return (
    <div className="border rounded p-4 mt-4 bg-gray-50">
      <h3 className="font-bold mb-2">Diagnóstico normalizado</h3>
      <div className="bg-white p-2 rounded font-mono whitespace-pre-wrap">
        <p><strong>Cliente:</strong> {data?.mikrotik?.comment ?? "-"}</p>
        <p><strong>Domicilio:</strong> {data?.direccion ?? "-"}</p>
        <p><strong>Plan:</strong> {data?.plan ?? "-"}</p>
        <p><strong>Nodo:</strong> {data?.nodo_nombre ? data.nodo_nombre + " - " + (data?.nodo_ip ?? "-") : "-"}</p>
        <p><strong>OLT:</strong> {data?.OLT ?? "-"}</p>
        <p><strong>PPPoE User:</strong> {data?.pppoe_username ?? "-"}</p>
        <p><strong>Estado PPPoE:</strong> {traducciones[data?.mikrotik?.active] ?? "-"}</p>
        <p><strong>Tiempo activo:</strong> {data?.mikrotik?.uptime ?? "-"}</p>
        <p><strong>Última conexión:</strong> {data?.mikrotik?.secret?.["last-logged-out"] ?? "-"}</p>
        <p><strong>ONU s/n:</strong> {data?.onu_sn ?? "-"}</p>
        <p><strong>ONU Estado:</strong> {traducciones[data?.onu_status_smrt?.onu_status] ?? "-"}</p>
        <p><strong>ONU Último cambio de estado:</strong> {data?.onu_status_smrt?.last_status_change ?? "-"}</p>
        <p><strong>ONU Señal:</strong> {traducciones[data?.onu_signal_smrt?.onu_signal] ?? "-"}</p>
        <p><strong>ONU Señal Detalle:</strong> {data?.onu_signal_smrt?.onu_signal_value ?? "-"}</p>
      </div>
      <CopyButton text={outputText} />
    </div>
  );
}
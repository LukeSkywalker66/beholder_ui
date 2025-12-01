import { useState } from "react";

interface CopyButtonProps {
  text: string; // el texto que querés copiar
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // feedback por 2 segundos
    } catch (err) {
      console.error("Error copiando al portapapeles", err);
    }
  };

  return (
    <div>
      <button onClick={copyToClipboard}>
        Copiar al portapapeles
      </button>
      {copied && <span style={{ marginLeft: "8px" }}>✔ Copiado</span>}
    </div>
  );
}
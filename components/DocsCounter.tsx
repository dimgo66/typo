"use client";

import { useEffect, useState } from "react";

export default function DocsCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const ns = window.location.hostname.replace(/\./g, "_");
    fetch(`https://countapi.xyz/get/${ns}/docs`).then(async (r) => {
      if (r.status === 404) {
        // Key отсутствует — создаём со значением 0
        await fetch(`https://countapi.xyz/set/${ns}/docs/0`);
        setCount(0);
        return;
      }
      const d = await r.json();
      setCount(d.value ?? 0);
    }).catch(() => setCount(null));
  }, []);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-800">
      📄 {count === null ? "..." : count.toLocaleString("ru-RU")}
    </span>
  );
}

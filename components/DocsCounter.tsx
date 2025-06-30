"use client";

import { useEffect, useState } from "react";

export default function DocsCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/docs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCount(d.value ?? 0))
      .catch(() => setCount(null));
  }, []);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-800">
      📄 {count === null ? "..." : count.toLocaleString("ru-RU")}
    </span>
  );
}

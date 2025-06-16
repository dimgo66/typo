"use client";

import { useEffect, useState } from "react";

export default function VisitsCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.countapi.xyz/hit/typography.vercel.app/visits")
      .then((r) => r.json())
      .then((d) => setCount(d.value))
      .catch(() => setCount(null));
  }, []);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-gray-800">
      👁 {count === null ? "..." : count.toLocaleString("ru-RU")}
    </span>
  );
}

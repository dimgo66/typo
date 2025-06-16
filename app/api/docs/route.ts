import { NextResponse } from "next/server";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("Upstash Redis env vars are not set");
}

async function redisFetch(cmd: string) {
  if (!url || !token) {
    return null;
  }
  const res = await fetch(`${url}/${cmd}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // Upstash requires GET for get and incr endpoints
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? data.result ?? data ?? null;
}

export async function GET() {
  let val = await redisFetch("get/docs");
  if (val === null) {
    // key likely missing -> init to 0
    await redisFetch("set/docs/0");
    val = 0;
  }
  return NextResponse.json({ value: Number(val) || 0 });
}

export async function POST() {
  const val = await redisFetch("incr/docs");
  return NextResponse.json({ value: Number(val) || 0 });
}
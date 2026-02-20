import { config } from "@/config";

const BASE = "";

export async function request<T>(
  path: string,
  opts?: RequestInit & { params?: Record<string, string> }
): Promise<T> {
  let url = `${BASE}${path}`;
  if (opts?.params) {
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== null && v !== "") {
        filtered[k] = String(v);
      }
    }
    const search = new URLSearchParams(filtered).toString();
    if (search) url += (path.includes("?") ? "&" : "?") + search;
  }
  const { params, ...fetchOpts } = opts || {};
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": config.adminToken,
      ...fetchOpts?.headers,
    },
    ...fetchOpts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json() as Promise<T>;
}

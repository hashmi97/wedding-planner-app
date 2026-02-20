import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    client = createClient(url, key);
  }
  return client;
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function rowToCamel<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[toCamel(k)] = v;
  }
  return out;
}

export function objToSnake<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) {
      out[toSnake(k)] = v;
    }
  }
  return out;
}

type ListParams = { search?: string; status?: string; category?: string; type?: string };

export async function listRows(
  table: string,
  params?: ListParams
): Promise<Record<string, unknown>[]> {
  const sb = getSupabase();
  let query = sb.from(table).select("*").eq("deleted", false);
  if (params?.status) query = query.eq("status", params.status);
  if (params?.category) query = query.eq("category", params.category);
  if (params?.type) query = query.eq("type", params.type);
  const { data, error } = await query;
  if (error) throw error;
  let rows = (data || []) as Record<string, unknown>[];
  if (params?.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((r) =>
      Object.values(r).some((v) => v && String(v).toLowerCase().includes(q))
    );
  }
  return rows.map((r) => rowToCamel(r));
}

export async function insertRow(
  table: string,
  row: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const sb = getSupabase();
  const snake = objToSnake(row) as Record<string, unknown>;
  const { data, error } = await sb.from(table).insert(snake).select().single();
  if (error) throw error;
  return rowToCamel(data as Record<string, unknown>);
}

export async function updateRowById(
  table: string,
  id: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const sb = getSupabase();
  const snake = objToSnake(updates) as Record<string, unknown>;
  const { data, error } = await sb.from(table).update(snake).eq("id", id).select().single();
  if (error) throw error;
  return rowToCamel(data as Record<string, unknown>);
}

export async function softDeleteRow(table: string, id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from(table)
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

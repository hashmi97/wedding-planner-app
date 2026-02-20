import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { requireAuth, jsonResponse, parseBody, handlePreflight, isValidUuid } from "./_lib/types";
import { listRows, insertRow, updateRowById, softDeleteRow } from "./_lib/supabase";

const TABLE = "notes";

const NOTE_FIELDS = [
  "title",
  "body",
  "tags",
];

export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext
) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  const authError = requireAuth(event);
  if (authError) return authError;

  const { httpMethod, queryStringParameters, body } = event;
  const params = queryStringParameters || {};
  const id = params.id;

  if (httpMethod === "GET") {
    try {
      const rows = await listRows(TABLE, {
        search: params.search,
      });
      return jsonResponse(200, rows);
    } catch (err) {
      return jsonResponse(500, { error: "Failed to fetch" }, { sanitizeError: true });
    }
  }

  if (httpMethod === "POST") {
    const payload = parseBody(body);
    if (!payload) return jsonResponse(400, { error: "Invalid JSON body" });

    const now = new Date().toISOString();
    const row: Record<string, unknown> = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };
    for (const f of NOTE_FIELDS) {
      row[f] = payload[f] !== undefined && payload[f] !== null ? String(payload[f]) : null;
    }

    try {
      const created = await insertRow(TABLE, row);
      return jsonResponse(201, created);
    } catch (err) {
      return jsonResponse(500, { error: "Failed to create" }, { sanitizeError: true });
    }
  }

  if (httpMethod === "PUT") {
    if (!id) return jsonResponse(400, { error: "Missing id query parameter" });
    if (!isValidUuid(id)) return jsonResponse(400, { error: "Invalid id format" });
    const payload = parseBody(body);
    if (!payload) return jsonResponse(400, { error: "Invalid JSON body" });

    try {
      const updates: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };
      for (const f of NOTE_FIELDS) {
        if (payload[f] === undefined) continue;
        const v = payload[f];
        updates[f] = v !== null && v !== undefined ? String(v) : null;
      }
      const updated = await updateRowById(TABLE, id, updates);
      return jsonResponse(200, updated);
    } catch (err) {
      return jsonResponse(500, { error: "Failed to update" }, { sanitizeError: true });
    }
  }

  if (httpMethod === "DELETE") {
    if (!id) return jsonResponse(400, { error: "Missing id query parameter" });
    if (!isValidUuid(id)) return jsonResponse(400, { error: "Invalid id format" });
    try {
      await softDeleteRow(TABLE, id);
      return jsonResponse(200, { status: "deleted" });
    } catch (err) {
      return jsonResponse(500, { error: "Failed to delete" }, { sanitizeError: true });
    }
  }

  return jsonResponse(405, { error: "Method not allowed" });
};

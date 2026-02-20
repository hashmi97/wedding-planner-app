import { timingSafeEqual } from "crypto";

export type Dict = Record<string, string | number | boolean | undefined>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 512 * 1024; // 512KB

export function parseBody(body: string | null): Record<string, unknown> | null {
  if (!body) return null;
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function requireAuth(event: { headers: Record<string, string | undefined> }): { statusCode: number; body: string } | null {
  const token = event.headers["x-admin-token"] ?? "";
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (!expected || !safeCompare(token, expected)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }
  return null;
}

export function isValidUuid(id: string | undefined): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
  "Access-Control-Max-Age": "86400",
};

export function handlePreflight(event: { httpMethod?: string }): { statusCode: number; headers: Record<string, string>; body: string } | null {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: { ...CORS_HEADERS },
      body: "",
    };
  }
  return null;
}

export function jsonResponse(statusCode: number, data: unknown, opts?: { sanitizeError?: boolean }) {
  const sanitize = opts?.sanitizeError && statusCode >= 500;
  const body = sanitize && typeof data === "object" && data !== null && "error" in data
    ? { error: "Internal server error" }
    : data;
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

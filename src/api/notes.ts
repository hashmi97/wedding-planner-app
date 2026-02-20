import { request } from "./client";
import type { Note } from "./types";

const PATH = "/.netlify/functions/notes";

export const notesApi = {
  list: (params?: { search?: string }) =>
    request<Note[]>(PATH, { params: params as Record<string, string> }),

  create: (payload: Partial<Note>) =>
    request<Note>(PATH, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<Note>) =>
    request<Note>(PATH, {
      method: "PUT",
      params: { id },
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ status: string }>(PATH, { method: "DELETE", params: { id } }),
};

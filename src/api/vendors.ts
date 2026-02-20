import { request } from "./client";
import type { Vendor } from "./types";

const PATH = "/.netlify/functions/vendors";

export const vendorsApi = {
  list: (params?: { search?: string; status?: string; category?: string }) =>
    request<Vendor[]>(PATH, { params: params as Record<string, string> }),

  create: (payload: Partial<Vendor>) =>
    request<Vendor>(PATH, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<Vendor>) =>
    request<Vendor>(PATH, {
      method: "PUT",
      params: { id },
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ status: string }>(PATH, { method: "DELETE", params: { id } }),
};

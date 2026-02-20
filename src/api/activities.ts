import { request } from "./client";
import type { Activity } from "./types";

const PATH = "/.netlify/functions/activities";

export const activitiesApi = {
  list: (params?: { search?: string }) =>
    request<Activity[]>(PATH, { params: params as Record<string, string> }),

  create: (payload: Partial<Activity>) =>
    request<Activity>(PATH, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Activity>) =>
    request<Activity>(PATH, {
      method: "PUT",
      params: { id },
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ status: string }>(PATH, { method: "DELETE", params: { id } }),
};

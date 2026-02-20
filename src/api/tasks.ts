import { request } from "./client";
import type { Task } from "./types";

const PATH = "/.netlify/functions/tasks";

export const tasksApi = {
  list: (params?: { search?: string; status?: string; category?: string }) =>
    request<Task[]>(PATH, { params: params as Record<string, string> }),

  create: (payload: Partial<Task>) =>
    request<Task>(PATH, { method: "POST", body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<Task>) =>
    request<Task>(PATH, {
      method: "PUT",
      params: { id },
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    request<{ status: string }>(PATH, { method: "DELETE", params: { id } }),
};

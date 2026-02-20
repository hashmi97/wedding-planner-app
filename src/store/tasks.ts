import { create } from "zustand";
import { tasksApi } from "@/api";
import type { Task } from "@/api/types";

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
  fetch: (params?: { search?: string; status?: string; category?: string }) => Promise<void>;
  create: (payload: Partial<Task>) => Promise<Task | null>;
  update: (id: string, payload: Partial<Task>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const items = await tasksApi.list(params);
      set({ items, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch",
        loading: false,
      });
    }
  },
  create: async (payload) => {
    set({ error: null });
    try {
      const created = await tasksApi.create(payload);
      set((s) => ({ items: [created, ...s.items] }));
      return created;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create",
      });
      return null;
    }
  },
  update: async (id, payload) => {
    set({ error: null });
    try {
      await tasksApi.update(id, payload);
      await get().fetch();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update",
      });
    }
  },
  remove: async (id) => {
    set({ error: null });
    try {
      await tasksApi.delete(id);
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete",
      });
    }
  },
}));

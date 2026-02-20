import { create } from "zustand";
import { activitiesApi } from "@/api";
import type { Activity } from "@/api/types";

interface ActivitiesState {
  items: Activity[];
  loading: boolean;
  error: string | null;
  fetch: (params?: { search?: string }) => Promise<void>;
  create: (payload: Partial<Activity>) => Promise<Activity | null>;
  update: (id: string, payload: Partial<Activity>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const items = await activitiesApi.list(params);
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
      const created = await activitiesApi.create(payload);
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
      await activitiesApi.update(id, payload);
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
      await activitiesApi.delete(id);
      set((s) => ({ items: s.items.filter((a) => a.id !== id) }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete",
      });
    }
  },
}));

import { create } from "zustand";
import { vendorsApi } from "@/api";
import type { Vendor } from "@/api/types";

interface VendorsState {
  items: Vendor[];
  loading: boolean;
  error: string | null;
  fetch: (params?: { search?: string; status?: string; category?: string }) => Promise<void>;
  create: (payload: Partial<Vendor>) => Promise<Vendor | null>;
  update: (id: string, payload: Partial<Vendor>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useVendorsStore = create<VendorsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const items = await vendorsApi.list(params);
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
      const created = await vendorsApi.create(payload);
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
      await vendorsApi.update(id, payload);
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
      await vendorsApi.delete(id);
      set((s) => ({ items: s.items.filter((v) => v.id !== id) }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete",
      });
    }
  },
}));

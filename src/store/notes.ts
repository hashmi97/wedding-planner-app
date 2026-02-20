import { create } from "zustand";
import { notesApi } from "@/api";
import type { Note } from "@/api/types";

interface NotesState {
  items: Note[];
  loading: boolean;
  error: string | null;
  fetch: (params?: { search?: string }) => Promise<void>;
  create: (payload: Partial<Note>) => Promise<Note | null>;
  update: (id: string, payload: Partial<Note>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const items = await notesApi.list(params);
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
      const created = await notesApi.create(payload);
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
      await notesApi.update(id, payload);
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
      await notesApi.delete(id);
      set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete",
      });
    }
  },
}));

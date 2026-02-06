import { create } from "zustand";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const useNoteStore = create((set) => ({
  notes: [],
  isLoading: false,
  isRateLimited: false,

  getNotes: async () => {
    try {
      set({ isLoading: true, isRateLimited: false });
      const res = await axiosInstance.get("/note/getNotes");

      set({ notes: res.data.notes });
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to get notes: " + error.response.data.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createNode: async (title, content) => {
    try {
      set({ isLoading: true, isRateLimited: false });
      const res = await axiosInstance.post("/note/create", { title, content });

      set((state) => ({
        notes: [...state.notes, res.data.note],
      }));
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        toast.error("Slow down! You're creating notes too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else {
        toast.error("Failed to create note: " + error.response.data.message);
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNote: async (noteId) => {
    try {
      set({isRateLimited: false });
      await axiosInstance.delete(`/note/${noteId}`);

      set((state) => ({
        notes: state.notes.filter((note) => note._id != noteId),
      }));
      toast.success("Note deleted successfully");
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to delete note: " + error.response.data.message);
      }
    }
  },

  updateNode: async (noteId, title, content) => {
    try {
      set({ isLoading: true, isRateLimited: false });
      const res = await axiosInstance.post("/note/update", {
        noteId,
        title,
        content,
      });

      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === res.data.note._id ? res.data.note : note,
        ),
      }));
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to update note: " + error.response.data.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setNotes: async (notes) => {
    set({ isRateLimited: false, notes });
  },
}));

export default useNoteStore;

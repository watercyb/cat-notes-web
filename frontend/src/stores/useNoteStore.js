import { create } from "zustand";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";

const useNoteStore = create((set, get) => ({
  notes: [],
  isLoading: false,
  isUploading: false,
  isRateLimited: false,
  isLoadingNode: false,

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

  createNode: async (title, content, version, isEncrypted) => {
    try {
      set({ isLoading: true, isRateLimited: false });
      const res = await axiosInstance.post("/note/create", {
        title,
        content,
        version,
        isEncrypted,
      });

      set((state) => ({
        notes: [...state.notes, res.data.note],
      }));
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to create note: " + error.response.data.message, {
          id: "create",
        });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNote: async (noteId) => {
    try {
      set({ isRateLimited: false });
      await axiosInstance.delete(`/note/${noteId}`);

      set((state) => ({
        notes: state.notes.filter((note) => note._id != noteId),
      }));
      toast.success("Note deleted successfully");
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to delete note: " + error.response.data.message);
      }
      return false;
    }
  },

  updateNote: async (noteId, title, content, version, isEncrypted) => {
    try {
      set({ isUploading: true, isRateLimited: false });
      const res = await axiosInstance.post("/note/update", {
        noteId,
        title,
        content,
        version,
        isEncrypted,
      });

      if (!res.data.success) {
        set((state) => ({
          notes: [
            ...state.notes.map((note) =>
              note._id === res.data.noteFromServer._id
                ? res.data.noteFromServer
                : note,
            ),
            res.data.newNote,
          ],
        }));
        toast.success("Duplicate notes found. Both versions were kept.");
        return true;
      } else {
        set((state) => ({
          notes: state.notes.map((note) =>
            note._id === res.data.note._id ? res.data.note : note,
          ),
        }));
        toast.success("Note updated successfully");
        return false;
      }
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else {
        toast.error("Failed to update note: " + error.response.data.message);
      }
    } finally {
      set({ isUploading: false });
    }
  },

  setNotes: async (notes) => {
    set({ isRateLimited: false, notes });
  },

  clearRateLimit: () => {
    set({ isRateLimited: false });
  },

  getNote: async (id) => {
    try {
      set({ isLoadingNode: true, isRateLimited: false });
      const res = await axiosInstance.get("/note/" + id);

      if (res.data?.success) {
        set({
          notes: [
            ...get().notes.filter((note) => note._id != id),
            res.data.note,
          ],
        });
      }
    } catch (error) {
      console.log(error);
      if (error.response.status == 429) {
        set({ isRateLimited: true });
      } else if (error.response.status == 403) {
        set({
          notes: [...get().notes.filter((note) => note._id != id)],
        });
      } else {
        toast.error("Failed to get notes: " + error.response.data.message);
      }
    } finally {
      set({ isLoadingNode: false });
    }
  },
}));

export default useNoteStore;

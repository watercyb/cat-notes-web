import { create } from "zustand";
import axiosInstance from "../utils/axios";

const useNoteStore = create((set) => ({
  notes: [],
  isLoading: false,
  error: null,
  isRateLimited: false,

  getNotes: async () => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      const res = await axiosInstance.get("/note/getNotes");

      set({ notes: res.data.notes });
    } catch (error) {
      set({ error: error.response.data.message || "Error getting notes" });
      if (error.response.status == 429) set({ isRateLimited: true });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useNoteStore;

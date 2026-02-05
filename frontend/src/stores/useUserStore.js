import { create } from "zustand";
import axiosInstance from "../utils/axios";

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  isRateLimited: false,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post("/auth/login", { email, password });

      set({ user: res.data.user });
    } catch (error) {
      set({ error: error.response.data.message || "Error logging in" });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });

      set({ user: res.data.user });
      return true;
    } catch (error) {
      set({ error: error.response.data.message || "Error signing up" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (code) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post("/auth/verify-email", { code });

      set({ user: res.data.user });
      return true;
    } catch (error) {
      set({ error: error.response.data.message || "Error verify email" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true, error: null });
      const res = await axiosInstance.get("/auth/check-auth");

      set({ user: res.data.user });
    } catch (error) {
      console.log(error.response.data.message || "Error check auth");
      set({ user: null });
      if (error.response.status == 429) set({ isRateLimited: true });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.post("/auth/logout");

      set({ user: null });
    } catch (error) {
      set({
        user: null,
        error: error.response.data.message || "Error logout",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.post("/auth/forgot-password", { email });
    } catch (error) {
      set({ error: error.response.data.message || "Error forgot password" });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token, password) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      return true;
    } catch (error) {
      set({ error: error.response.data.message || "Error reset password" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useUserStore;

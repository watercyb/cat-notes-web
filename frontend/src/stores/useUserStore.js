import { create } from "zustand";
import axiosInstance from "../utils/axios";
import useNoteStore from "./useNoteStore";
import toast from "react-hot-toast";

const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  isRateLimited: false,
  isForgotPassword: false,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      const res = await axiosInstance.post("/auth/login", { email, password });

      set({ user: res.data.user });
      useNoteStore.getState().setNotes(res.data.user.notes);
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error logging in" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      const res = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });

      set({ user: res.data.user });
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error signing up" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyEmail: async (code) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      const res = await axiosInstance.post("/auth/verify-email", { code });

      set({ user: res.data.user });
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error verify email" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true, error: null, isRateLimited: false });
      const res = await axiosInstance.get("/auth/check-auth");

      set({ user: res.data.user });
      useNoteStore.getState().setNotes(res.data.user.notes);
    } catch (error) {
      set({ user: null });
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else if (error.response.status != 401) {
        set({ error: error.response.data.message || "Error check auth" });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      await axiosInstance.post("/auth/logout");

      set({ user: null });
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error logout" });
      }
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      await axiosInstance.post("/auth/forgot-password", { email });
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error forgot password" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token, password) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error reset password" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  resendEmail: async () => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      await axiosInstance.post("/auth/resend-email");
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error reset password" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearRateLimit: () => {
    set({ isRateLimited: false });
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      if (newPassword !== confirmPassword) {
        set({ error: "Passwords do not match" });
        return false;
      }
      await axiosInstance.post("/auth/password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error change password" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  changeUsername: async (name) => {
    try {
      set({ isLoading: true, error: null, isRateLimited: false });
      await axiosInstance.post("/auth/username", { name });

      set((state) => ({ user: { ...state.user, name } }));
      toast.success("Username updated successfully");
      return true;
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      } else {
        set({ error: error.response.data.message || "Error change username" });
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    try {
      await axiosInstance.post("/auth/refresh");
    } catch (error) {
      if (error.response.status == 429) {
        set({ isRateLimited: true });
        set({ error: "Too many requests, please slow down" });
      }
    }
  },
}));

export default useUserStore;

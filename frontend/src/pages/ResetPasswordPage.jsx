import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import useUserStore from "../stores/useUserStore";
import { useEffect } from "react";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading, message, clearError } =
    useUserStore();

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (await resetPassword(token, password)) {
      toast.success(
        "Password reset successfully, redirecting to login page...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
      max-w-md
      w-full
      overflow-hidden
      rounded-[30px]
      border
      border-white/40
      bg-white/70
      backdrop-blur-xl
      shadow-2xl
      shadow-orange-200/30
    "
    >
      <div className="p-10">
        <h1
          className="
          mb-2
          text-center
          text-4xl
          font-black
          text-[#5B4A42]
        "
        >
          Reset Password 🔐
        </h1>

        <p
          className="
          mb-8
          text-center
          text-[#9A8378]
        "
        >
          Create a new password for your account
        </p>

        {error && (
          <div
            className="
            mb-4
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            p-3
            text-center
            font-medium
            text-rose-500
          "
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="
            mb-4
            rounded-xl
            border
            border-orange-100
            bg-[#FFF1E6]
            p-3
            text-center
            font-medium
            text-[#F08A3C]
          "
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            icon={Lock}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
            mt-6
            h-14
            w-full
            rounded-2xl
            text-lg
            font-semibold
            text-white
            bg-linear-to-r
            from-[#F5A247]
            to-[#EE8337]
            shadow-lg
            shadow-orange-300/40
            transition-all
            hover:from-[#EE943E]
            hover:to-[#E66F25]
            disabled:opacity-60
          "
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Set New Password ✨"}
          </Motion.button>
        </form>
      </div>
    </Motion.div>
  );
};
export default ResetPasswordPage;

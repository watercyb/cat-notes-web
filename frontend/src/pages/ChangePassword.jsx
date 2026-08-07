import { motion as Motion } from "framer-motion";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useState } from "react";
import { Loader, Lock, Mail, User } from "lucide-react";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
import { useEffect } from "react";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isLoading, error, changePassword, clearError } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (await changePassword(oldPassword, newPassword, confirmPassword))
      navigate("/");
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
      max-w-120
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
          Change Password 🔐
        </h1>

        <p
          className="
          mb-8
          text-center
          text-[#9A8378]
        "
        >
          Keep your notes safe and secure
        </p>

        <form onSubmit={handleChangePassword}>
          <Input
            icon={Lock}
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            icon={Lock}
            isMismatch={newPassword !== confirmPassword}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div
              className="
              mt-3
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

          <div className="mt-4">
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
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
          >
            {isLoading ? (
              <Loader className="mx-auto animate-spin" size={24} />
            ) : (
              "Change Password ✨"
            )}
          </Motion.button>
        </form>
      </div>

      <div
        className="
        border-t
        border-white/40
        bg-[#FFF7F2]/80
        py-5
        text-center
      "
      >
        <Link
          to="/"
          className="
          font-semibold
          text-[#F08A3C]
          hover:text-[#E76F1E]
        "
        >
          ← Go back
        </Link>
      </div>
    </Motion.div>
  );
};

export default ChangePassword;

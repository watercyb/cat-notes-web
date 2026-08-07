import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import toast from "react-hot-toast";
import useUserStore from "../stores/useUserStore";

const RESEND_COOLDOWN = 60;

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyEmail, resendEmail, logout, clearError } =
    useUserStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (await verifyEmail(verificationCode)) {
      toast.success("Email verified successfully");
      navigate("/");
    }
  };

  // Auto submit when all fields are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    try {
      await resendEmail();
      toast.success("Verification code resent");
      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      toast.error("Failed to resend code");
    }
  };

  return (
    <div
      className="
      min-h-screen
      w-full
      bg-linear-to-br
      from-[#FFF7F2]
      via-[#FFF9F5]
      to-[#FCEFE5]
      flex
      items-center
      justify-center
      px-4
    "
    >
      <Motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
        w-full
        max-w-md
        rounded-[30px]
        border
        border-white/40
        bg-white/70
        backdrop-blur-xl
        shadow-2xl
        shadow-orange-200/30
        p-8
      "
      >
        <h1
          className="
          mb-3
          text-center
          text-3xl
          font-black
          text-[#5B4A42]
        "
        >
          Verify Your Email 🐱
        </h1>

        <p
          className="
          mb-8
          text-center
          text-[#9A8378]
        "
        >
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code input */}
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="
                w-12
                h-14
                rounded-2xl
                border-2
                border-[#E7D7CC]
                bg-white/70
                text-center
                text-2xl
                font-black
                text-[#5B4A42]
                outline-none
                transition
                focus:border-[#F08A3C]
                focus:ring-2
                focus:ring-orange-200
              "
              />
            ))}
          </div>

          {error && (
            <div
              className="
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

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="
            h-14
            w-full
            rounded-2xl
            border-0
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
            disabled:opacity-50
          "
          >
            {isLoading ? "Verifying..." : "Verify Email ✨"}
          </Motion.button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="
            font-semibold
            text-[#F08A3C]
            hover:text-[#E76F1E]
            disabled:text-[#B9A59B]
            disabled:cursor-not-allowed
          "
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend verification code"}
          </button>
        </div>

        {/* Other account */}
        <Motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => logout()}
          className="
          mt-6
          flex
          items-center
          gap-1
          text-sm
          font-medium
          text-[#9A8378]
          hover:text-[#F08A3C]
          transition
        "
        >
          ← Use other account
        </Motion.button>
      </Motion.div>
    </div>
  );
};

export default EmailVerificationPage;

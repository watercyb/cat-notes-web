import { motion as Motion } from "framer-motion";
import { useState } from "react";
import Input from "../components/Input";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
import { useEffect } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isForgotPassword, error, forgotPassword, clearError } =
    useUserStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await forgotPassword(email)) setIsSubmitted(true);
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
          Forgot Password 🐱
        </h1>

        {!isSubmitted ? (
          <>
            <p
              className="
              mb-6
              text-center
              text-[#9A8378]
            "
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                mt-2
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
                disabled={isForgotPassword}
              >
                {isForgotPassword ? (
                  <Loader className="size-6 animate-spin mx-auto" />
                ) : (
                  "Send Reset Link ✨"
                )}
              </Motion.button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-[#F5A247]
              shadow-lg
              shadow-orange-200/50
            "
            >
              <Mail className="h-8 w-8 text-white" />
            </Motion.div>

            <p
              className="
              text-[#8E766C]
              leading-relaxed
            "
            >
              If an account exists for{" "}
              <span className="font-semibold text-[#5B4A42]">{email}</span>, you
              will receive a password reset link shortly.
            </p>
          </div>
        )}
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
          to="/login"
          className="
          inline-flex
          items-center
          gap-2
          font-semibold
          text-[#F08A3C]
          hover:text-[#E76F1E]
        "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </Motion.div>
  );
};
export default ForgotPasswordPage;

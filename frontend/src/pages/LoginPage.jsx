import { useState } from "react";
import { Loader, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Input from "../components/Input";
import useUserStore from "../stores/useUserStore.js";
import GoogleLogin from "../components/GoogleLogin.jsx";
import { useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useUserStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
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
      border border-white/40
      bg-white/70
      backdrop-blur-xl
      shadow-2xl
      shadow-orange-200/30
    "
    >
      <div className="px-10 pt-10 pb-3">
        <h1 className="mb-2 text-center text-4xl font-black text-[#5B4A42]">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-[#9A8378]">
          Continue your reading journey 🐱
        </p>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mb-6 flex justify-end">
            <Link
              to="/forgot-password"
              className="font-medium text-[#F08A3C] transition hover:text-[#E76F1E]"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center font-medium text-rose-500">
              {error}
            </div>
          )}

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="
            btn
            w-full
            h-14
            border-0
            rounded-2xl
            text-lg
            text-white
            bg-linear-to-r
            from-[#F5A247]
            to-[#EE8337]
            hover:from-[#EE943E]
            hover:to-[#E66F25]
            shadow-lg
            shadow-orange-300/40
            transition-all
          "
          >
            {isLoading ? <Loader className="h-6 w-6 animate-spin" /> : "Login"}
          </Motion.button>

          <div className="my-7 flex items-center">
            <div className="h-px flex-1 bg-[#E7D7CC]" />

            <span className="mx-4 text-sm font-semibold tracking-wider text-[#A58F84]">
              OR
            </span>

            <div className="h-px flex-1 bg-[#E7D7CC]" />
          </div>

          <GoogleLogin />
        </form>
      </div>

      <div className="border-t border-white/40 bg-[#FFF7F2]/80 py-5 text-center">
        <p className="text-[#8E766C]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#F08A3C] hover:text-[#E76F1E]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Motion.div>
  );
};
export default LoginPage;

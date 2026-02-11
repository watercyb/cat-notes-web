import { useSignIn } from "@clerk/clerk-react";
import useUserStore from "../stores/useUserStore";
import { FcGoogle } from "react-icons/fc";
import { motion as Motion } from "framer-motion";

const GoogleLogin = () => {
  const { signIn, isLoaded } = useSignIn();
  const { isLoading } = useUserStore();

  const handleGoogleLogin = async () => {
    signIn?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso_callback",
      redirectUrlComplete: "/auth_callback",
      strategyOptions: {
        prompt: "select_account",
      },
    });
  };

  return (
    <Motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGoogleLogin}
      disabled={isLoading || !isLoaded}
      className="w-full mb-6 flex items-center justify-center gap-3 py-3 px-4 
             bg-white text-gray-800 font-semibold rounded-lg shadow-md
             hover:bg-gray-100 transition duration-200"
    >
      <FcGoogle className="w-5 h-5" />
      Continue with Google
    </Motion.button>
  );
};

export default GoogleLogin;

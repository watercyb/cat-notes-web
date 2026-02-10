import { useAuth, useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

const AuthCallbackPage = () => {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [unableReg, setUnableReg] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;
      const token = await getToken();
      if (token) {
        try {
          await axiosInstance.get("/auth/check-auth", {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigate("/");
        } catch (error) {
          setUnableReg(true);
          setError(error);
        }
      }
    };
    syncUser();
  }, [getToken, isLoaded, navigate, user]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="w-[90%] max-w-md bg-zinc-900 border-zinc-800">
        <div className="flex flex-col items-center gap-4 pt-6">
          <Loader className="size-6 text-emerald-500 animate-spin" />
          {unableReg ? (
            <h3 className="text-zinc-400 text-xl font-bold">
              Unable to register user: {error || "Internal error"}
            </h3>
          ) : (
            <h3 className="text-zinc-400 text-xl font-bold">Logging you in</h3>
          )}
          {unableReg ? (
            <Link to="/" className="text-zinc-400 text-sm">
              Click to redirect
            </Link>
          ) : (
            <p className="text-zinc-400 text-sm">Redirecting...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

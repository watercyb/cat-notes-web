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
      <div
        className="
        w-[90%]
        max-w-md
        rounded-[30px]
        border
        border-white/50
        bg-white/75
        backdrop-blur-xl
        shadow-2xl
        shadow-orange-200/30
        p-8
      "
      >
        <div
          className="
          flex
          flex-col
          items-center
          gap-5
          text-center
        "
        >
          <div
            className="
            rounded-full
            p-4
            bg-[#FFF1E6]
            border
            border-orange-100
          "
          >
            <Loader
              className="
              size-8
              text-[#F08A3C]
              animate-spin
            "
            />
          </div>

          {unableReg ? (
            <h3
              className="
              text-[#5B4A42]
              text-xl
              font-black
            "
            >
              Unable to register user
            </h3>
          ) : (
            <h3
              className="
              text-[#5B4A42]
              text-xl
              font-black
            "
            >
              Logging you in 🐱
            </h3>
          )}

          {unableReg ? (
            <>
              <p
                className="
                text-sm
                text-[#9A8378]
                max-w-xs
              "
              >
                {error || "Internal error"}
              </p>

              <Link
                to="/"
                className="
                mt-2
                rounded-2xl
                px-6
                py-3
                font-semibold
                text-white
                bg-linear-to-r
                from-[#F5A247]
                to-[#EE8337]
                shadow-lg
                shadow-orange-300/40
                hover:scale-[1.02]
                transition-all
              "
              >
                Click to redirect
              </Link>
            </>
          ) : (
            <p
              className="
              text-sm
              text-[#9A8378]
            "
            >
              Redirecting...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;

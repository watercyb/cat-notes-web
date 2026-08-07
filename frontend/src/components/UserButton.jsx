import { useEffect, useRef, useState } from "react";
import useUserStore from "../stores/useUserStore";
import { getColorFromName } from "../utils/getColorFromName";
import { useNavigate } from "react-router-dom";
import ChangeUsernameDialog from "./ChangeUsernameDialog";

const UserButton = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user.name?.charAt(0).toUpperCase() ?? "?";
  const bgColor = getColorFromName(user.name);

  if (!user.email?.includes("@")) return null;

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
        w-10
        h-10
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-black
        cursor-pointer
        overflow-hidden
        shadow-md
        shadow-orange-200/40
        transition-transform
        duration-150
        hover:scale-105
        focus:outline-none
        ${bgColor}
      `}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
          absolute
          right-0
          mt-3
          w-56
          overflow-hidden
          rounded-3xl
          border
          border-white/50
          bg-white
          backdrop-blur-xl
          shadow-2xl
          shadow-orange-200/30
          z-50
        "
        >
          {/* User info */}
          <div
            className="
            px-5
            py-4
            border-b
            border-[#E7D7CC]
          "
          >
            <div
              className="
              font-black
              text-[#5B4A42]
            "
            >
              {user.name}
            </div>

            {user.email && (
              <div
                className="
                mt-1
                text-sm
                text-[#9A8378]
                truncate
              "
              >
                {user.email}
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="p-2 space-y-1">
            <ChangeUsernameDialog />

            <button
              className="
              w-full
              rounded-xl
              px-4
              py-2
              text-left
              font-medium
              text-[#8E766C]
              hover:bg-[#FFF1E6]
              hover:text-[#F08A3C]
              transition
            "
              onClick={() => {
                navigate("/change-password");
              }}
            >
              Change Password
            </button>

            <button
              className="
              w-full
              rounded-xl
              px-4
              py-2
              text-left
              font-medium
              text-rose-400
              hover:bg-rose-50
              transition
            "
              onClick={() => {
                navigate("/delete");
              }}
            >
              Delete Account
            </button>

            <button
              className="
              w-full
              rounded-xl
              px-4
              py-2
              text-left
              font-medium
              text-rose-400
              hover:bg-rose-50
              transition
            "
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;

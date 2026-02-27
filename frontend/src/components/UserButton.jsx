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
    <div ref={ref} className="relative pointer-coarse:">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden focus:outline-none transition-transform duration-150 ${bgColor}`}
      >
        <span>{initial}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow-lg rounded-lg z-50">
          <div className="px-4 py-3 border-b border-base-200">
            <div className="font-semibold">{user.name}</div>
            {user.email && (
              <div className="text-sm text-base-content/70">{user.email}</div>
            )}
          </div>

          <ul className="menu menu-compact p-2">
            <li>
              <ChangeUsernameDialog />
            </li>
            <li>
              <button
                className=""
                onClick={() => {
                  navigate("/change-password");
                }}
              >
                Change Password
              </button>
            </li>
            <li>
              <button className="text-error" onClick={logout}>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserButton;

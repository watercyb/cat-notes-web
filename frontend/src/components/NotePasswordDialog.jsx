import { useState } from "react";

const PasswordDialog = ({ open, showConfirm, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleConfirm = () => {
    if (confirm && password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    onConfirm(password);
    setPassword("");
    setConfirm("");
  };

  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/20
      backdrop-blur-sm
      px-4
    "
    >
      <div
        className="
        w-full
        max-w-md
        rounded-[30px]
        border
        border-white/50
        bg-white/80
        backdrop-blur-xl
        shadow-2xl
        shadow-orange-200/30
        p-8
      "
      >
        <h2
          className="
          text-2xl
          font-black
          text-center
          text-[#5B4A42]
          mb-4
        "
        >
          {showConfirm ? "Set Password 🔒" : "Note Password 🔑"}
        </h2>

        <div className="py-4 space-y-4">
          <input
            type="password"
            placeholder="Password"
            className="
            w-full
            rounded-2xl
            border
            border-[#E7D7CC]
            bg-white/70
            px-4
            py-3
            text-[#5B4A42]
            placeholder-[#B9A59B]
            outline-none
            transition
            focus:border-[#F08A3C]
            focus:ring-2
            focus:ring-orange-200
          "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {showConfirm && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="
              w-full
              rounded-2xl
              border
              border-[#E7D7CC]
              bg-white/70
              px-4
              py-3
              text-[#5B4A42]
              placeholder-[#B9A59B]
              outline-none
              transition
              focus:border-[#F08A3C]
              focus:ring-2
              focus:ring-orange-200
            "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            className="
            h-11
            rounded-2xl
            px-6
            font-medium
            text-[#8E766C]
            bg-[#FFF7F2]
            border
            border-[#E7D7CC]
            hover:bg-[#FCEFE5]
            transition
          "
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="
            h-11
            rounded-2xl
            px-6
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
            onClick={handleConfirm}
          >
            Confirm ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDialog;

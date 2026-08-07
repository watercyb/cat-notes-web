import { useState } from "react";
import useUserStore from "../stores/useUserStore";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useRef } from "react";
import { useEffect } from "react";

export default function ChangeUsernameDialog() {
  const { isLoading, error, changeUsername } = useUserStore();
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!username) {
      toast.error("Username cannot be empty");
    } else {
      //Dialog will be closed by updating username -> re-render
      await changeUsername(username);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
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
      >
        Change Username
      </button>

      {/* Dialog */}
      {createPortal(
        <dialog
          ref={dialogRef}
          className="
                rounded-[30px]
                border
                border-white/50
                bg-white/80
                backdrop-blur-xl
                shadow-2xl
                shadow-orange-200/30
                p-0
                w-full
                max-w-md
                m-auto
            "
        >
          <div className="p-8">
            <h3
              className="
            mb-5
            text-2xl
            font-black
            text-[#5B4A42]
          "
            >
              Change Username 🐱
            </h3>

            <input
              type="text"
              placeholder="Enter new username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            focus:border-[#F08A3C]
            focus:ring-2
            focus:ring-orange-200
          "
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

            <div className="mt-6 flex justify-end gap-3">
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
            "
                onClick={() => {
                  setIsOpen(false);
                }}
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
              disabled:opacity-60
            "
                disabled={isLoading}
                onClick={handleUpdate}
              >
                {isLoading ? "Updating..." : "Update ✨"}
              </button>
            </div>
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}

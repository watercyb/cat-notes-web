import { Link } from "react-router";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import useUserStore from "../stores/useUserStore";
import { useClerk, useUser } from "@clerk/clerk-react";

const DeleteAccount = () => {
  const { deleteAccount } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const clerk = useClerk();
  const { isSignedIn } = useUser();

  const handleDelete = async () => {
    await deleteAccount();
    if (isSignedIn) await clerk.signOut();
    setIsOpen(false);
  };

  return (
    <div
      className="
            min-h-xl
            flex
            items-center
            justify-center
            bg-linear-to-br
            from-[#FFF7F2]
            via-[#FFF9F5]
            to-[#FCEFE5]
            p-4
        "
    >
      <div
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
        p-10
        text-center
      "
      >
        <div
          className="
                mx-auto
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-rose-50
                border
                border-rose-100
            "
        >
          <Trash2Icon className="size-8 text-rose-400" />
        </div>

        <h1
          className="
          mb-3
          text-3xl
          font-black
          text-[#5B4A42]
        "
        >
          Delete Account?
        </h1>

        <p
          className="
          mb-8
          text-[#9A8378]
          leading-relaxed
        "
        >
          This action is permanent and cannot be undone. All your notes and
          associated data will be permanently removed.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="
            rounded-2xl
            px-6
            py-3
            font-medium
            text-[#8E766C]
            bg-[#FFF7F2]
            border
            border-[#E7D7CC]
            hover:bg-[#FCEFE5]
            transition
          "
          >
            Back to Home
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="
            rounded-2xl
            px-6
            py-3
            font-semibold
            text-white
            bg-rose-400
            shadow-lg
            shadow-rose-200/50
            hover:bg-rose-500
            transition
          "
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <dialog
        open={isOpen}
        className="
        rounded-[30px]
        border
        border-white/50
        bg-white/80
        backdrop-blur-xl
        shadow-2xl
        p-0
        max-w-md
        w-[90%]
        m-auto
      "
      >
        <div className="p-8">
          <h3
            className="
            text-2xl
            font-black
            text-[#5B4A42]
            mb-4
          "
          >
            Are you sure? 🥺
          </h3>

          <p
            className="
            text-[#8E766C]
            leading-relaxed
          "
          >
            Your account, notes, and all related data will be permanently
            deleted.
          </p>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="
              rounded-2xl
              px-5
              py-2.5
              bg-[#FFF7F2]
              border
              border-[#E7D7CC]
              text-[#8E766C]
              font-medium
            "
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              className="
              rounded-2xl
              px-5
              py-2.5
              bg-rose-400
              text-white
              font-semibold
              hover:bg-rose-500
              transition
            "
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default DeleteAccount;

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
    <div className="min-w-sm bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Home
            </Link>
            <button
              onClick={() => {
                setIsOpen(true);
              }}
              className="btn btn-error btn-outline"
            >
              <Trash2Icon className="h-5 w-5" />
              Delete Account
            </button>

            <input
              type="checkbox"
              className="modal-toggle"
              checked={isOpen}
              readOnly
            />
            <div className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Delete your account?</h3>
                <p className="py-4">
                  This action is permanent and cannot be undone. All your notes
                  and associated data will be permanently removed.
                </p>
                <div className="modal-action">
                  <button onClick={() => setIsOpen(false)} className="btn">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="btn btn-error">
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;

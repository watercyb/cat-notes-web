import { useState } from "react";

export default function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    // TODO: replace with your delete logic
    console.log("Account deleted");
    setIsOpen(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-error"
      >
        Delete Account
      </button>

      <input type="checkbox" className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete your account?</h3>
          <p className="py-4">
            This action is permanent and cannot be undone. All your notes
            and associated data will be permanently removed.
          </p>
          <div className="modal-action">
            <button onClick={() => setIsOpen(false)} className="btn">Cancel</button>
            <button onClick={handleDelete} className="btn btn-error">Yes, delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
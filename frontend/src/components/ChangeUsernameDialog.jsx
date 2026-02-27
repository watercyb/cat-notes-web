import { useState } from "react";
import useUserStore from "../stores/useUserStore";
import toast from "react-hot-toast";

export default function ChangeUsernameDialog() {
  const { isLoading, error, changeUsername } = useUserStore();
  const [username, setUsername] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async () => {
    if (!username) {
      toast.error("Username cannot be empty");
    } else {
      //Dialog will be closed by updating username -> re-render
      await changeUsername(username);
    }
  };

  return (
    <div>
      {/* Button to open dialog */}
      <button onClick={() => setIsOpen(true)}>Change Username</button>

      {/* Dialog */}
      <input
        type="checkbox"
        id="username-dialog"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Change Username</h3>
          <input
            type="text"
            placeholder="Enter new username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input input-bordered w-full mt-4"
          />
          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={isLoading}
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

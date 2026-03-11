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
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          {showConfirm ? "Set Password" : "Note Password"}
        </h3>

        <div className="py-4 space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="input input-bordered w-full"
            value={confirm}
            hidden={!showConfirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>

          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDialog;

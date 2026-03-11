import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import useNoteStore from "../stores/useNoteStore";
import PasswordDialog from "../components/NotePasswordDialog";
import { encryptText } from "../utils/crypto";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const { isLoading, createNode } = useNoteStore();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let c = content;
    if (isEncrypted) c = await encryptText(password, content);
    if (await createNode(title, c, 0, isEncrypted)) {
      toast.success("Note created successfully!", { id: "create" });
      navigate("/");
    }
  };

  const secureNote = (e) => {
    if (e.target.checked) {
      setShowPasswordDialog(true);
    } else {
      setPassword("");
      setIsEncrypted(false);
    }
  };

  return (
    <div>
      <PasswordDialog
        open={showPasswordDialog}
        isConfirm={true}
        onClose={() => {
          setShowPasswordDialog(false);
          setPassword("");
          setIsEncrypted(false);
        }}
        onConfirm={(password) => {
          if (password) {
            setPassword(password);
            setIsEncrypted(true);
          } else {
            setPassword("");
            setIsEncrypted(false);
          }
          setShowPasswordDialog(false);
        }}
      />

      <div className="container mx-auto min-w-sm px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Note</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Note Title"
                    className="input input-bordered"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    placeholder="Write your note here..."
                    className="textarea textarea-bordered h-32"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end items-center">
                  <label className="label cursor-pointer mr-auto">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isEncrypted}
                      onChange={secureNote}
                    />
                    <span className="label-text ml-2">Secure Note</span>
                  </label>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;

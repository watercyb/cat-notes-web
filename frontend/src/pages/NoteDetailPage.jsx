import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import useNoteStore from "../stores/useNoteStore";

const NoteDetailPage = () => {
  const { notes, isUploading, deleteNote, updateNote } = useNoteStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(0);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const note = notes.find((item) => item._id === id);
    if (!note) {
      toast.error("Note not found. Please refresh the page and try again.", {
        id: "note-error",
      });
      navigate("/");
    } else {
      setTitle(note.title);
      setContent(note.content);
      setVersion(note.version + 1);
    }
  }, [id, navigate, notes]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    if (deleteNote(id)) navigate("/");
  };

  const handleSave = async () => {
    if (await updateNote(id, title, content, version)) navigate("/");
  };

  return (
    <div className="min-w-sm bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-outline"
            >
              <Trash2Icon className="h-5 w-5" />
              Delete Note
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Note title"
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

              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  disabled={isUploading}
                  onClick={handleSave}
                >
                  {isUploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;

import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import useNoteStore from "../stores/useNoteStore";
import PasswordDialog from "../components/NotePasswordDialog";
import { decryptText, encryptText } from "../utils/crypto";
const NoteDetailPage = () => {
  const { notes, isUploading, deleteNote, updateNote, getNote } =
    useNoteStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(0);
  const [isEncrypted, setIsEncrypted] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoadedNode, setIsLoadedNode] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const reloadNode = async () => {
      await getNote(id);
      setIsLoadedNode(true);
      const note = notes.find((item) => item._id === id);
      if (!note) {
        toast.error("Note not found. Please refresh the page and try again.", {
          id: "note-error",
        });
        navigate("/");
      } else {
        if (note.isEncrypted) {
          setShowConfirm(false);
          setShowDialog(true);
        } else {
          setShowContent(true);
        }
        setTitle(note.title);
        setContent(note.content);
        setVersion(note.version + 1);
        setIsEncrypted(note.isEncrypted);
      }
    };

    reloadNode();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEncrypted, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    if (deleteNote(id)) navigate("/");
  };

  const handleSave = async () => {
    if (
      await updateNote(
        id,
        title,
        isEncrypted ? await encryptText(password, content) : content,
        version,
        isEncrypted,
      )
    )
      navigate("/");
    setVersion(version + 1);
  };

  const changePassword = () => {
    setShowConfirm(true);
    setShowDialog(true);
  };

  return (
    <>
      {!isLoadedNode && (
        <div className="mx-2 my-8 flex min-h-40 min-w-65 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary" />
            <div className="text-sm font-medium text-gray-600">
              Loading note...
            </div>
          </div>
        </div>
      )}
      {isLoadedNode && (
        <>
          <PasswordDialog
            open={showDialog}
            showConfirm={showConfirm}
            onClose={() => {
              setShowDialog(false);
              if (!showConfirm) navigate("/");
            }}
            onConfirm={async (password) => {
              if (!showConfirm) {
                try {
                  setContent(await decryptText(password, content));
                  setShowContent(true);
                  setPassword(password);
                } catch {
                  toast.error("Invalid password");
                  navigate("/");
                }
              } else {
                if (password) {
                  setPassword(password);

                  if (
                    await updateNote(
                      id,
                      title,
                      await encryptText(password, content),
                      version,
                      isEncrypted,
                    )
                  ) {
                    navigate("/");
                  }

                  setVersion(version + 1);
                  toast.success("Password updated");
                } else {
                  toast.error("Password cannot be empty");
                }
              }

              setShowDialog(false);
            }}
          />

          <div
            className="
        min-w-xl
        bg-linear-to-br
        from-[#FFF7F2]
        via-[#FFF9F5]
        to-[#FCEFE5]
        px-4
        py-4
      "
          >
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                {/* Page actions */}
                <div
                  className="
              flex
              items-center
              justify-between
              mb-3
            "
                >
                  <Link
                    to="/"
                    className="
                inline-flex
                items-center
                gap-2
                text-[#9A8378]
                font-medium
                hover:text-[#F08A3C]
                transition
              "
                  >
                    <ArrowLeftIcon className="size-5" />
                    Back to Notes
                  </Link>

                  <button
                    onClick={handleDelete}
                    className="
                inline-flex
                items-center
                gap-2
                rounded-2xl
                px-4
                py-2
                border
                border-rose-200
                bg-white/60
                text-rose-500
                hover:bg-rose-50
                transition
              "
                  >
                    <Trash2Icon className="size-5" />
                    Delete Note
                  </button>
                </div>

                {/* Editor */}
                <div
                  className="
              rounded-[30px]
              border
              border-white/50
              bg-white/80
              backdrop-blur-xl
              shadow-2xl
              shadow-orange-200/30
              px-10
              py-5
            "
                >
                  <div className="flex items-center justify-between mb-6">
                    <h1
                      className="
                  text-3xl
                  font-black
                  text-[#5B4A42]
                "
                    >
                      Note Detail 🐱
                    </h1>

                    {isEncrypted && (
                      <span
                        className="
                    rounded-full
                    px-4
                    py-1
                    bg-[#FFF1E6]
                    border
                    border-orange-100
                    text-sm
                    font-semibold
                    text-[#F08A3C]
                  "
                      >
                        🔒 Encrypted
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label
                      className="
                  block
                  mb-2
                  font-semibold
                  text-[#8E766C]
                "
                    >
                      Title
                    </label>

                    <input
                      type="text"
                      placeholder="Note title"
                      className="
                  w-full
                  rounded-2xl
                  border
                  border-[#E7D7CC]
                  bg-white/70
                  px-4
                  py-3
                  text-[#5B4A42]
                  outline-none
                  focus:border-[#F08A3C]
                  focus:ring-2
                  focus:ring-orange-200
                "
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Content */}
                  {showContent && (
                    <div className="mb-8">
                      <label
                        className="
                    block
                    mb-2
                    font-semibold
                    text-[#8E766C]
                  "
                      >
                        Content
                      </label>

                      <textarea
                        placeholder="Write your note here..."
                        className="
                        w-full
                        min-h-64
                        min-w-xl
                        max-w-5xl
                        resize
                        rounded-2xl
                        border
                        border-[#E7D7CC]
                        bg-white/70
                        px-4
                        py-3
                        text-[#5B4A42]
                        outline-none
                        transition
                        focus:border-[#F08A3C]
                        focus:ring-2
                        focus:ring-orange-200
                    "
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="
                flex
                items-center
                justify-between
              "
                  >
                    {isEncrypted ? (
                      <button
                        onClick={changePassword}
                        className="
                    rounded-2xl
                    px-5
                    py-3
                    bg-[#FFF1E6]
                    border
                    border-orange-100
                    text-[#F08A3C]
                    font-semibold
                    hover:bg-[#FCEFE5]
                    transition
                  "
                      >
                        🔑 Update Password
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      className="
                  rounded-2xl
                  px-8
                  py-3
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
                      disabled={isUploading}
                      onClick={handleSave}
                    >
                      {isUploading ? "Saving..." : "Save Changes ✨"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
export default NoteDetailPage;

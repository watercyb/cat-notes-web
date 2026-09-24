import { X } from "lucide-react";
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
    <>
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

      <div className="container mx-auto min-w-sm px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div
            className="
            rounded-[30px]
            border
            border-white/50
            bg-white/70
            backdrop-blur-xl
            shadow-2xl
            shadow-orange-200/30
            p-10
          "
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Close"
              className="
                absolute
                right-6
                top-6
                flex
                size-9
                items-center
                justify-center
                rounded-full
                text-[#7A6258]
                transition-colors
                hover:bg-[#F5E8DF]
                hover:text-[#D95F02]
                "
            >
              <X className="size-5" />
            </button>

            <h2
              className="
              mb-6
              text-3xl
              font-black
              text-[#5B4A42]
            "
            >
              Create New Note
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-5">
                <label className="mb-2 block font-semibold text-[#8E766C]">
                  Title
                </label>

                <input
                  type="text"
                  placeholder="Note Title"
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-[#E7D7CC]
                  bg-white/60
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="mb-2 block font-semibold text-[#8E766C]">
                  Content
                </label>

                <textarea
                  placeholder="Write your note here..."
                  className="
                  w-full
                  h-40
                  resize-none
                  rounded-2xl
                  border
                  border-[#E7D7CC]
                  bg-white/60
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Secure Note */}
                <label
                  className="
                  flex
                  items-center
                  gap-3
                  cursor-pointer
                  text-[#8E766C]
                  font-medium
                "
                >
                  <input
                    type="checkbox"
                    className="
                        size-5
                        appearance-none
                        rounded-md
                        border
                        border-[#E7D7CC]
                        bg-white
                        cursor-pointer
                        transition-all
                        checked:border-[#F08A3C]
                        checked:bg-[#F08A3C]
                  "
                    checked={isEncrypted}
                    onChange={secureNote}
                  />

                  <span>Secure Note 🔒</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                  h-12
                  rounded-2xl
                  border-0
                  px-7
                  font-semibold
                  text-white
                  bg-linear-to-r
                  from-[#F5A247]
                  to-[#EE8337]
                  shadow-lg
                  shadow-orange-300/40
                  transition-all
                  hover:scale-[1.02]
                  hover:from-[#EE943E]
                  hover:to-[#E66F25]
                  disabled:opacity-60
                "
                >
                  {isLoading ? "Creating..." : "Create Note ✨"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default CreatePage;

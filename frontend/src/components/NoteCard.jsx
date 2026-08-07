import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../utils/formatDate";
import useNoteStore from "../stores/useNoteStore";
import { FiLock } from "react-icons/fi";

const NoteCard = ({ note }) => {
  const { deleteNote } = useNoteStore();

  return (
    <Link
      to={`/note/${note._id}`}
      className="
      block
      rounded-3xl
      border
      border-white/50
      border-l-4
      border-l-[#F5A247]
      bg-white/75
      backdrop-blur-xl
      shadow-md
      shadow-orange-100/40
      p-6
      transition-all
      duration-200
      hover:-translate-y-1
      hover:shadow-xl
      hover:shadow-orange-200/40
    "
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2
            className="
            text-xl
            font-black
            text-[#5B4A42]
            line-clamp-2
          "
          >
            {note.title}
          </h2>

          <button
            className="
            rounded-xl
            p-2
            text-[#C98B82]
            hover:bg-rose-50
            hover:text-rose-500
            transition
          "
            onClick={(e) => {
              e.preventDefault();

              if (!window.confirm("Are you sure you want to delete this note?"))
                return;

              deleteNote(note._id);
            }}
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>

        {/* Content */}
        {note.isEncrypted ? (
          <div
            className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-[#FFF1E6]
            border
            border-orange-100
            px-4
            py-3
            text-[#F08A3C]
            font-semibold
          "
          >
            🔒 Secure Note
          </div>
        ) : (
          <p
            className="
            text-[#8E766C]
            line-clamp-3
            leading-relaxed
          "
          >
            {note.content}
          </p>
        )}

        {/* Footer */}
        <div
          className="
          text-sm
          text-[#B09A90]
        "
        >
          {formatDate(new Date(note.createdAt))}
        </div>
      </div>
    </Link>
  );
};
export default NoteCard;

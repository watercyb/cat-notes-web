import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../utils/formatDate";
import useNoteStore from "../stores/useNoteStore";

const NoteCard = ({ note }) => {
  const { deleteNote } = useNoteStore();

  return (
    <Link
      to={`/note/${note._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body p-3 sm:p-4">
        <h3 className="card-title text-base-content line-clamp-3">
          {note.title}
        </h3>
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4 hidden sm:inline" />
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => {
                e.preventDefault();

                if (
                  !window.confirm("Are you sure you want to delete this note?")
                )
                  return;

                deleteNote(note._id);
              }}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default NoteCard;

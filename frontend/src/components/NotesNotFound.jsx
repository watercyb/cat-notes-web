import { NotebookIcon } from "lucide-react";
import { Link } from "react-router";

const NotesNotFound = () => {
  return (
    <div
      className="
      max-w-md
      mx-auto
      my-16
      rounded-[30px]
      border
      border-white/50
      bg-white/70
      backdrop-blur-xl
      shadow-2xl
      shadow-orange-200/30
      p-10
      flex
      flex-col
      items-center
      text-center
    "
    >
      <div
        className="
        mb-6
        rounded-full
        p-8
        bg-[#FFF1E6]
        border
        border-orange-100
        shadow-inner
      "
      >
        <NotebookIcon className="size-12 text-[#F08A3C]" />
      </div>

      <h3
        className="
        mb-3
        text-3xl
        font-black
        text-[#5B4A42]
      "
      >
        No notes yet
      </h3>

      <p
        className="
        mb-8
        leading-relaxed
        text-[#8E766C]
      "
      >
        Ready to organize your thoughts? Create your first note and start your
        cozy writing journey.
      </p>

      <Link
        to="/create"
        className="
        btn
        h-14
        rounded-2xl
        border-0
        px-8
        text-lg
        font-semibold
        text-white
        bg-linear-to-r
        from-[#F5A247]
        to-[#EE8337]
        shadow-lg
        shadow-orange-300/40
        transition-all
        hover:scale-[1.03]
        hover:from-[#EE943E]
        hover:to-[#E66F25]
      "
      >
        Create Your First Note ✨
      </Link>
    </div>
  );
};
export default NotesNotFound;

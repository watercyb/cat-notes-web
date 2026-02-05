import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import { useEffect } from "react";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import useNoteStore from "../stores/useNoteStore";
import LoadingSpinner from "../components/LoadingSpinner";

const HomePage = () => {
  const { notes, isLoading, isRateLimited, getNotes } = useNoteStore();

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  return (
    <div className="min-h-screen min-w-md">
      <Navbar />

      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {isLoading && (
          <div className="text-center text-primary py-10">Loading notes...</div>
        )}

        {notes.length === 0 && !isRateLimited && !isLoading && (
          <NotesNotFound />
        )}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;

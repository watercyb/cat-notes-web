import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import useNoteStore from "../stores/useNoteStore";

const HomePage = () => {
  const { notes, isLoading, isRateLimited } = useNoteStore();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {isLoading && (
          <div className="text-center text-primary py-10">Loading notes...</div>
        )}

        {notes.length === 0 && !isRateLimited && !isLoading && (
          <NotesNotFound />
        )}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

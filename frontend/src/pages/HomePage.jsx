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
          <div className="mx-2 my-8 flex min-h-40 min-w-65 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary" />
              <div className="text-sm font-medium text-gray-600">
                Loading notes...
              </div>
            </div>
          </div>
        )}

        {notes.length === 0 && !isRateLimited && !isLoading && (
          <NotesNotFound />
        )}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;

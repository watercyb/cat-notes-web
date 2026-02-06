import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import useUserStore from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import RateLimitedUI from "./components/RateLimitedUI";

const App = () => {
  const { user, isCheckingAuth, isRateLimited, checkAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-linear-to-br
    from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden"
    >
      {isRateLimited ? (
        <RateLimitedUI />
      ) : (
        <>
          <Routes>
            <Route path="/" element={user ? <HomePage /> : <LoginPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/note/:id" element={<NoteDetailPage />} />
          </Routes>
          <Toaster />
        </>
      )}
    </div>
  );
};

export default App;

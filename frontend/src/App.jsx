import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import { Navigate, Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import useUserStore from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RateLimitTopBar from "./components/RateLimitTopBar";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { useState } from "react";
import ChangePassword from "./pages/ChangePassword";
import DeleteAccount from "./pages/DeleteAccount";
import DeleteAccountDialog from "./pages/DeleteAccountDialog";

const App = () => {
  const user = useUserStore((s) => s.user);
  const isCheckingAuth = useUserStore((s) => s.isCheckingAuth);
  const checkAuth = useUserStore((s) => s.checkAuth);
  const [isCleckloading, setIsCleckloading] = useState(true);

  const CheckUser = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!user.isVerified) return <Navigate to="/verify-email" replace />;

    return children;
  };

  const BlockUser = ({ children }) => {
    if (user) return <Navigate to="/" replace />;

    return children;
  };

  useEffect(() => {
    checkAuth();
    setIsCleckloading(false);
  }, [checkAuth]);

  if (isCheckingAuth || isCleckloading) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-linear-to-br
    from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden"
    >
      <>
        <RateLimitTopBar />

        <Routes>
          <Route
            path="/sso_callback"
            element={<AuthenticateWithRedirectCallback />}
          />
          <Route path="/auth_callback" element={<AuthCallbackPage />} />
          <Route
            path="/"
            element={
              <CheckUser>
                <HomePage />
              </CheckUser>
            }
          />
          <Route
            path="/create"
            element={
              <CheckUser>
                <CreatePage />
              </CheckUser>
            }
          />
          <Route
            path="/note/:id"
            element={
              <CheckUser>
                <NoteDetailPage />
              </CheckUser>
            }
          />
          <Route
            path="/signup"
            element={
              <BlockUser>
                <SignUpPage />
              </BlockUser>
            }
          />
          <Route
            path="/login"
            element={
              <BlockUser>
                <LoginPage />
              </BlockUser>
            }
          />
          <Route
            path="/change-password"
            element={
              <CheckUser>
                <ChangePassword />
              </CheckUser>
            }
          />
          <Route
            path="/verify-email"
            element={
              !user || user?.isVerified ? (
                <Navigate to="/" replace />
              ) : (
                <EmailVerificationPage />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              <BlockUser>
                <ForgotPasswordPage />
              </BlockUser>
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/delete"
            element={
              <CheckUser>
                <DeleteAccount />
              </CheckUser>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </>
    </div>
  );
};

export default App;

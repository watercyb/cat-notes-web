import { motion as Motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import useUserStore from "../stores/useUserStore";
import useNoteStore from "../stores/useNoteStore";

const COUNTDOWN_SECONDS = 10;

const RateLimitTopBar = () => {
  const isRateLimitedUser = useUserStore((s) => s.isRateLimited);
  const clearRateLimitUser = useUserStore((s) => s.clearRateLimit);
  const isRateLimitedNote = useNoteStore((s) => s.isRateLimited);
  const clearRateLimitNote = useNoteStore((s) => s.clearRateLimit);

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isRateLimitedUser && !isRateLimitedNote) return;

    // reset countdown when rate limit triggers
    setSecondsLeft(COUNTDOWN_SECONDS);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isRateLimitedUser) clearRateLimitUser();
          if (isRateLimitedNote) clearRateLimitNote();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRateLimitedUser,
    isRateLimitedNote,
    clearRateLimitUser,
    clearRateLimitNote,
  ]);

  return (
    <AnimatePresence>
      {(isRateLimitedUser || isRateLimitedNote) && (
        <Motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Too many requests. Please wait
            <span className="font-bold tabular-nums">{secondsLeft}s</span>
            before trying again.
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default RateLimitTopBar;

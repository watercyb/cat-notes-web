import { Link } from "react-router";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import ClerkButton from "./ClerkButton";
import UserButton from "./UserButton";

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <header
      className="
      sticky
      top-0
      z-50
      border-b
      border-white/40
      bg-[#FCEFE5]/85
      backdrop-blur-xl
      shadow-sm
      shadow-orange-200/30
    "
    >
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="
            text-3xl
            font-black
            tracking-tight
            text-[#5B4A42]
            hover:text-[#F08A3C]
            transition-colors
          "
          >
            Cat Notes
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/create"
              className="
              btn
              h-12
              rounded-2xl
              border-0
              px-5
              text-white
              bg-linear-to-r
              from-[#F5A247]
              to-[#EE8337]
              shadow-lg
              shadow-orange-300/40
              transition-all
              hover:from-[#EE943E]
              hover:to-[#E66F25]
              hover:scale-[1.02]
            "
            >
              <PlusIcon className="size-5" />
              <span className="hidden sm:inline">New Note</span>
            </Link>

            {!isSignedIn ? <UserButton /> : <ClerkButton />}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

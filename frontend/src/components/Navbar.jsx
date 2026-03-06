import { Link } from "react-router";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import ClerkButton from "./ClerkButton";
import UserButton from "./UserButton";
import useUserStore from "../stores/useUserStore";

const Navbar = () => {
  const { isSignedIn } = useAuth();
  const { refresh } = useUserStore();

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
            ThinkBoard
          </h1>
          <div className="flex items-center gap-4">
            <Link to={"/create"} className="btn btn-primary">
              <PlusIcon className="size-5" />
              <span className="hidden sm:inline">New Note</span>
            </Link>
            {!isSignedIn ? <UserButton /> : <ClerkButton />}
            <button onClick={() => refresh()}>aaa</button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

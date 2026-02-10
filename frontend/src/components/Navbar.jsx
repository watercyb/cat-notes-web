import { Link } from "react-router";
import { LogOut, PlusIcon } from "lucide-react";
import useUserStore from "../stores/useUserStore";
import Clerk from "../utils/clerk";
import { useAuth } from "@clerk/clerk-react";

const Navbar = () => {
  const { logout } = useUserStore();
  const { isSignedIn } = useAuth();

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
              <span>New Note</span>
            </Link>
            {!isSignedIn ? (
              <LogOut
                className="size-6 text-red-500 cursor-pointer"
                onClick={() => logout()}
              />
            ) : (
              <Clerk />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;

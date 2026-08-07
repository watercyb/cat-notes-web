import { SignedOut, UserButton, useSignIn } from "@clerk/clerk-react";
import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClerkButton = () => {
  const { isLoaded } = useSignIn();
  const navigate = useNavigate();

  if (!isLoaded) return null;

  return (
    <div className="flex items-center gap-4">
      <SignedOut />

      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-10 !size-10",
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Action
            label="Delete account"
            labelIcon={<Trash2Icon className="size-4" />}
            onClick={() => navigate("/delete")}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

export default ClerkButton;

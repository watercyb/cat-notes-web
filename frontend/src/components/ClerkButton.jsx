import { SignedOut, UserButton, useSignIn } from "@clerk/clerk-react";

const ClerkButton = () => {
  const { isLoaded } = useSignIn();

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
      />
    </div>
  );
};

export default ClerkButton;

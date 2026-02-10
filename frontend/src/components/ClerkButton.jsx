import { SignedOut, UserButton, useSignIn } from "@clerk/clerk-react";

const ClerkButton = () => {
  const { isLoaded } = useSignIn();

  if (!isLoaded) return null;

  return (
    <div className="flex items-center gap-4">
      <SignedOut />
      <UserButton />
    </div>
  );
};

export default ClerkButton;

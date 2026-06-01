"use client";

import { useTransition } from "react";
import { LogIn, Loader2 } from "lucide-react";

import { signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isPending}
      onClick={() => startTransition(() => signInWithGoogle())}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <LogIn />
      )}
      Continue with Google
    </Button>
  );
}

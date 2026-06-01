import { LayoutDashboard } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function DashboardHeader({ name, email, image }: DashboardHeaderProps) {
  const greeting = getGreeting();
  const initials = (name ?? email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
          <LayoutDashboard className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}
            {name ? `, ${name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s your day at a glance.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
        <Avatar className="size-9">
          {image ? <AvatarImage src={image} alt={name ?? "User"} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <SignOutButton />
      </div>
    </header>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

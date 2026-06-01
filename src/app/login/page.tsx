import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  HardDrive,
  Images,
  LayoutDashboard,
} from "lucide-react";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  { icon: CalendarDays, label: "Calendar", desc: "Today & tomorrow's events" },
  { icon: CheckSquare, label: "Tasks", desc: "Track and complete to-dos" },
  { icon: HardDrive, label: "Drive", desc: "Your most recent files" },
  { icon: Images, label: "Photos", desc: "A memory of the day" },
] as const;

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="bg-primary text-primary-foreground mb-2 flex size-12 items-center justify-center rounded-xl">
            <LayoutDashboard className="size-6" />
          </div>
          <CardTitle className="text-2xl">Personal Dashboard</CardTitle>
          <CardDescription>
            Sign in with Google to connect your Calendar, Tasks, Drive and
            Photos in one minimalist place.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-muted/40 flex flex-col gap-1 rounded-lg border p-3"
              >
                <Icon className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-muted-foreground text-xs">{desc}</span>
              </div>
            ))}
          </div>
          <SignInButton />
          <p className="text-muted-foreground text-center text-xs">
            We request read/write access to Calendar & Tasks and read-only
            access to Drive & Photos. Tokens are encrypted at rest.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

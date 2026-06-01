import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  HardDrive,
  Images,
} from "lucide-react";

import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { TasksWidget } from "@/components/dashboard/tasks-widget";
import { DriveWidget } from "@/components/dashboard/drive-widget";
import { PhotosWidget } from "@/components/dashboard/photos-widget";
import { WidgetSkeleton } from "@/components/dashboard/widget-skeleton";

// The dashboard reads live data from Google, so it must never be statically
// cached at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        name={session.user.name}
        email={session.user.email}
        image={session.user.image}
      />

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense
          fallback={
            <WidgetSkeleton
              title="Calendar"
              icon={CalendarDays}
              className="lg:col-span-2"
            />
          }
        >
          <CalendarWidget userId={userId} />
        </Suspense>

        <Suspense
          fallback={<WidgetSkeleton title="Tasks" icon={CheckSquare} />}
        >
          <TasksWidget userId={userId} />
        </Suspense>

        <Suspense
          fallback={<WidgetSkeleton title="Drive" icon={HardDrive} />}
        >
          <DriveWidget userId={userId} />
        </Suspense>

        <Suspense
          fallback={
            <WidgetSkeleton
              title="Photos"
              icon={Images}
              className="lg:col-span-2"
            />
          }
        >
          <PhotosWidget userId={userId} />
        </Suspense>
      </section>
    </main>
  );
}

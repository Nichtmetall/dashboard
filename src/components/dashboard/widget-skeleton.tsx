import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { WidgetShell } from "@/components/dashboard/widget-shell";

export function WidgetSkeleton({
  title,
  icon,
  rows = 4,
  className,
}: {
  title: string;
  icon: LucideIcon;
  rows?: number;
  className?: string;
}) {
  return (
    <WidgetShell title={title} icon={icon} className={className}>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}

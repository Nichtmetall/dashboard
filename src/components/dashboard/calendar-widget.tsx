import { CalendarDays, MapPin } from "lucide-react";

import { getUpcomingEvents } from "@/lib/google/calendar";
import { formatTime } from "@/lib/format";
import type { CalendarEvent } from "@/lib/google/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  WidgetEmpty,
  WidgetError,
  WidgetShell,
} from "@/components/dashboard/widget-shell";

export async function CalendarWidget({ userId }: { userId: string }) {
  const result = await getUpcomingEvents(userId);

  return (
    <WidgetShell title="Calendar" icon={CalendarDays} className="lg:col-span-2">
      {!result.ok ? (
        <WidgetError message={result.error} />
      ) : result.data.length === 0 ? (
        <WidgetEmpty message="No events for today or tomorrow. Enjoy the calm!" />
      ) : (
        <ScrollArea className="h-72 pr-3">
          <div className="flex flex-col gap-4">
            <EventGroup
              label="Today"
              events={result.data.filter((e) => e.day === "today")}
            />
            <EventGroup
              label="Tomorrow"
              events={result.data.filter((e) => e.day === "tomorrow")}
            />
          </div>
        </ScrollArea>
      )}
    </WidgetShell>
  );
}

function EventGroup({
  label,
  events,
}: {
  label: string;
  events: CalendarEvent[];
}) {
  if (events.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      {events.map((event) => (
        <a
          key={event.id}
          href={event.htmlLink ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="hover:bg-accent/60 flex items-start gap-3 rounded-lg border p-3 transition-colors"
        >
          <div className="flex w-16 shrink-0 flex-col">
            {event.allDay ? (
              <Badge variant="secondary" className="text-[10px]">
                All day
              </Badge>
            ) : (
              <span className="text-sm font-medium tabular-nums">
                {formatTime(event.start)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{event.title}</p>
            {event.location ? (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate text-xs">
                <MapPin className="size-3 shrink-0" />
                {event.location}
              </p>
            ) : null}
          </div>
        </a>
      ))}
    </div>
  );
}

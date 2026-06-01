import { ExternalLink, FileText, HardDrive } from "lucide-react";

import { getRecentDriveFiles } from "@/lib/google/drive";
import { formatRelativeDay } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  WidgetEmpty,
  WidgetError,
  WidgetShell,
} from "@/components/dashboard/widget-shell";

export async function DriveWidget({ userId }: { userId: string }) {
  const result = await getRecentDriveFiles(userId);

  return (
    <WidgetShell title="Drive" icon={HardDrive}>
      {!result.ok ? (
        <WidgetError message={result.error} />
      ) : result.data.length === 0 ? (
        <WidgetEmpty message="No recent files found in your Drive." />
      ) : (
        <ScrollArea className="h-60 pr-3">
          <ul className="flex flex-col gap-1">
            {result.data.map((file) => (
              <li key={file.id}>
                <a
                  href={file.webViewLink ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:bg-accent/50 group flex items-center gap-3 rounded-md p-2"
                >
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeDay(file.modifiedTime)}
                    </p>
                  </div>
                  <ExternalLink className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </WidgetShell>
  );
}

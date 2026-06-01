import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WidgetShellProps {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Consistent card chrome shared by every dashboard widget. */
export function WidgetShell({
  title,
  icon: Icon,
  action,
  className,
  children,
}: WidgetShellProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="text-muted-foreground size-4" />
          {title}
        </CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground py-6 text-center text-sm">{message}</p>
  );
}

export function WidgetError({ message }: { message: string }) {
  return (
    <div className="text-muted-foreground flex items-start gap-2 rounded-lg border border-dashed p-3 text-sm">
      <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

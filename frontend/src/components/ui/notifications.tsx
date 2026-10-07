import { CircleCheck, Info, TriangleAlert, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast, useToasts, type ToastVariant } from "@/lib/toast";

const config: Record<
  ToastVariant,
  { icon: typeof CircleCheck; accent: string }
> = {
  success: { icon: CircleCheck, accent: "text-success" },
  info: { icon: Info, accent: "text-foreground" },
  warning: { icon: TriangleAlert, accent: "text-warning" },
  error: { icon: CircleAlert, accent: "text-destructive" },
};

/** Mount once, near the app root. Trigger notifications with `toast.*`. */
export function Notifications() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-100 flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6">
      {toasts.map((item) => {
        const { icon: Icon, accent } = config[item.variant];
        return (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-xs animate-in items-start gap-2.5 rounded-lg border border-border bg-background p-3 text-foreground shadow-sm duration-200 fade-in-0 motion-reduce:animate-none"
          >
            <Icon
              className={cn("mt-0.5 size-4 shrink-0", accent)}
              aria-hidden="true"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="text-[13px] font-semibold wrap-break-word">
                {item.title}
              </span>
              {item.body && (
                <span className="text-[11px] wrap-break-word text-muted-foreground">
                  {item.body}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
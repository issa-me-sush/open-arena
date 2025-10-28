import * as React from "react";
import { cn } from "@/components/ui/cn";

type Variant = "default" | "success" | "warning" | "destructive" | "outline";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const styleByVariant: Record<Variant, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
    destructive: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
    outline: "ring-1 ring-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        styleByVariant[variant],
        className
      )}
      {...props}
    />
  );
}



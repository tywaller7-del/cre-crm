"use client";

import { PROPERTY_TYPE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PropertyTypeBadge({ value }: { value: string }) {
  const pt = PROPERTY_TYPE_MAP[value];
  if (!pt) return <span className="text-xs text-muted-foreground">{value}</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        pt.bgLight,
        pt.textColor,
        pt.borderColor,
        "border"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", pt.color)} />
      {pt.label}
    </span>
  );
}

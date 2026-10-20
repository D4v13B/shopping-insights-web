import type { Icon } from "@tabler/icons-react";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: Icon;
}

export function KpiCard({ label, value, hint, icon: IconComponent }: KpiCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-xl tabular-nums 2xl:text-2xl">{value}</CardTitle>
        <CardAction>
          <IconComponent aria-hidden className="text-muted-foreground" />
        </CardAction>
        {hint ? <CardDescription>{hint}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}

export function KpiCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
      </CardHeader>
    </Card>
  );
}

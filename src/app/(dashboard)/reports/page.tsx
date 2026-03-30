import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Reports & Analytics</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Reporting dashboards will be built in a later phase.
      </p>
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-card">
        <BarChart3 className="h-12 w-12 mb-3 text-muted-foreground/30" />
        <p className="text-sm">Coming soon</p>
      </div>
    </div>
  );
}

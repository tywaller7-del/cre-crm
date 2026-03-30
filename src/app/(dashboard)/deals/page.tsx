import { Briefcase } from "lucide-react";

export default function DealsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Deal Pipeline</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Deal pipeline tracking will be built in the next phase.
      </p>
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-card">
        <Briefcase className="h-12 w-12 mb-3 text-muted-foreground/30" />
        <p className="text-sm">Coming soon</p>
      </div>
    </div>
  );
}

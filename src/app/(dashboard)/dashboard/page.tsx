import { Building, Users, Briefcase, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Lenders"
          value="0"
          icon={<Building className="h-5 w-5" />}
          subtitle="In database"
        />
        <StatCard
          title="Active Contacts"
          value="0"
          icon={<Users className="h-5 w-5" />}
          subtitle="Across all lenders"
        />
        <StatCard
          title="Active Deals"
          value="0"
          icon={<Briefcase className="h-5 w-5" />}
          subtitle="In pipeline"
        />
        <StatCard
          title="Volume YTD"
          value="$0"
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Closed this year"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">
            No activity logged yet. Start by adding lenders and contacts.
          </p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <h2 className="font-semibold mb-3">Upcoming Follow-ups</h2>
          <p className="text-sm text-muted-foreground">
            No follow-ups scheduled. Set reminders on your contacts.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-muted-foreground/50">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

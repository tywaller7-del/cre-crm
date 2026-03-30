"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpDown, ExternalLink } from "lucide-react";
import { PropertyTypeBadge } from "@/components/lenders/property-type-badge";
import {
  LenderFilterPanel,
  emptyFilters,
  type LenderFilters,
} from "@/components/lenders/lender-filters";
import { cn } from "@/lib/utils";
import type { Lender } from "@/types/database";

type SortKey = "name" | "lender_type" | "status" | "max_ltv" | "relationship_strength" | "last_contact_date";
type SortDir = "asc" | "desc";

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LenderFilters>(emptyFilters);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchLenders() {
      const { data } = await supabase
        .from("lenders")
        .select("*")
        .order("name");
      setLenders((data as Lender[]) || []);
      setLoading(false);
    }
    fetchLenders();
  }, []);

  const filtered = useMemo(() => {
    let result = lenders;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q));
    }
    if (filters.propertyTypes.length) {
      result = result.filter((l) =>
        filters.propertyTypes.some((pt) => l.property_types.includes(pt))
      );
    }
    if (filters.lenderTypes.length) {
      result = result.filter((l) => filters.lenderTypes.includes(l.lender_type));
    }
    if (filters.loanTypes.length) {
      result = result.filter((l) =>
        filters.loanTypes.some((lt) => l.loan_types.includes(lt))
      );
    }
    if (filters.states.length) {
      result = result.filter((l) =>
        filters.states.some(
          (s) => l.geography.includes(s) || l.geography.includes("national")
        )
      );
    }
    if (filters.loanSizeMin) {
      const min = parseFloat(filters.loanSizeMin);
      result = result.filter((l) => l.loan_size_max === null || l.loan_size_max >= min);
    }
    if (filters.loanSizeMax) {
      const max = parseFloat(filters.loanSizeMax);
      result = result.filter((l) => l.loan_size_min === null || l.loan_size_min <= max);
    }
    if (filters.maxLtv) {
      const ltv = parseFloat(filters.maxLtv);
      result = result.filter((l) => l.max_ltv !== null && l.max_ltv >= ltv);
    }
    if (filters.recourse) {
      result = result.filter((l) => l.recourse === filters.recourse);
    }
    if (filters.status) {
      result = result.filter((l) => l.status === filters.status);
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [lenders, filters, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return "-";
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Lender Database</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} lender{filtered.length !== 1 ? "s" : ""}{" "}
            {filters.search || filters.propertyTypes.length ? "(filtered)" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/lenders/new")} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Lender
        </Button>
      </div>

      <LenderFilterPanel filters={filters} onChange={setFilters} />

      <div className="mt-4 border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Type" sortKey="lender_type" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">Property Types</th>
                <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">Loan Size</th>
                <SortHeader label="Max LTV" sortKey="max_ltv" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Strength" sortKey="relationship_strength" current={sortKey} dir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Loading lenders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    {lenders.length === 0 ? (
                      <div className="space-y-2">
                        <p>No lenders yet.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/lenders/new")}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add your first lender
                        </Button>
                      </div>
                    ) : (
                      "No lenders match your filters."
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((lender) => (
                  <tr
                    key={lender.id}
                    onClick={() => router.push(`/lenders/${lender.id}`)}
                    className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{lender.name}</div>
                      {lender.hq_city && lender.hq_state && (
                        <div className="text-xs text-muted-foreground">
                          {lender.hq_city}, {lender.hq_state}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs">{lender.lender_type}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {lender.property_types.map((pt) => (
                          <PropertyTypeBadge key={pt} value={pt} />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                      {lender.loan_size_min || lender.loan_size_max
                        ? `${formatCurrency(lender.loan_size_min)} - ${formatCurrency(lender.loan_size_max)}`
                        : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {lender.max_ltv ? `${lender.max_ltv}%` : "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={lender.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <RelationshipDots strength={lender.relationship_strength} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey: key,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  return (
    <th
      className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => onSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            current === key ? "text-foreground" : "text-muted-foreground/40"
          )}
        />
      </span>
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-gray-50 text-gray-500 border-gray-200",
    prospect: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium border capitalize",
        colors[status] || ""
      )}
    >
      {status}
    </span>
  );
}

function RelationshipDots({ strength }: { strength: number | null }) {
  if (!strength) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i <= strength ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

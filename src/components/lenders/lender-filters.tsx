"use client";

import { useState } from "react";
import {
  PROPERTY_TYPES,
  LENDER_TYPES,
  LOAN_TYPES,
  US_STATES,
  STATE_NAMES,
  LENDER_STATUSES,
  RECOURSE_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LenderFilters {
  search: string;
  propertyTypes: string[];
  lenderTypes: string[];
  loanTypes: string[];
  states: string[];
  loanSizeMin: string;
  loanSizeMax: string;
  maxLtv: string;
  recourse: string;
  status: string;
}

const emptyFilters: LenderFilters = {
  search: "",
  propertyTypes: [],
  lenderTypes: [],
  loanTypes: [],
  states: [],
  loanSizeMin: "",
  loanSizeMax: "",
  maxLtv: "",
  recourse: "",
  status: "",
};

export function LenderFilterPanel({
  filters,
  onChange,
}: {
  filters: LenderFilters;
  onChange: (f: LenderFilters) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const activeCount =
    filters.propertyTypes.length +
    filters.lenderTypes.length +
    filters.loanTypes.length +
    filters.states.length +
    (filters.loanSizeMin ? 1 : 0) +
    (filters.loanSizeMax ? 1 : 0) +
    (filters.maxLtv ? 1 : 0) +
    (filters.recourse ? 1 : 0) +
    (filters.status ? 1 : 0);

  function toggleArray(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  return (
    <div className="space-y-3">
      {/* Search bar + toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lenders by name..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={() => setExpanded(!expanded)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="default" onClick={() => onChange(emptyFilters)}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          {/* Property Types */}
          <FilterSection label="Property Type">
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      propertyTypes: toggleArray(filters.propertyTypes, pt.value),
                    })
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer",
                    filters.propertyTypes.includes(pt.value)
                      ? cn(pt.bgLight, pt.textColor, pt.borderColor)
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", pt.color)} />
                  {pt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection label="Status">
            <div className="flex gap-2">
              {LENDER_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      status: filters.status === s.value ? "" : s.value,
                    })
                  }
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                    filters.status === s.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Lender Type */}
          <FilterSection label="Lender Type">
            <div className="flex flex-wrap gap-1.5">
              {LENDER_TYPES.map((lt) => (
                <button
                  key={lt}
                  onClick={() =>
                    onChange({
                      ...filters,
                      lenderTypes: toggleArray(filters.lenderTypes, lt),
                    })
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                    filters.lenderTypes.includes(lt)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {lt}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Loan Type */}
          <FilterSection label="Loan Type">
            <div className="flex flex-wrap gap-1.5">
              {LOAN_TYPES.map((lt) => (
                <button
                  key={lt}
                  onClick={() =>
                    onChange({
                      ...filters,
                      loanTypes: toggleArray(filters.loanTypes, lt),
                    })
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                    filters.loanTypes.includes(lt)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {lt}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Geography */}
          <FilterSection label="Geography">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() =>
                  onChange({
                    ...filters,
                    states: filters.states.includes("national")
                      ? filters.states.filter((s) => s !== "national")
                      : [...filters.states, "national"],
                  })
                }
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                  filters.states.includes("national")
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                National
              </button>
              {US_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() =>
                    onChange({
                      ...filters,
                      states: toggleArray(filters.states, st),
                    })
                  }
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer",
                    filters.states.includes(st)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                  title={STATE_NAMES[st]}
                >
                  {st}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Numeric filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterSection label="Loan Size Min ($)">
              <input
                type="number"
                value={filters.loanSizeMin}
                onChange={(e) =>
                  onChange({ ...filters, loanSizeMin: e.target.value })
                }
                placeholder="e.g. 1000000"
                className="w-full h-8 px-2 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FilterSection>
            <FilterSection label="Loan Size Max ($)">
              <input
                type="number"
                value={filters.loanSizeMax}
                onChange={(e) =>
                  onChange({ ...filters, loanSizeMax: e.target.value })
                }
                placeholder="e.g. 50000000"
                className="w-full h-8 px-2 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FilterSection>
            <FilterSection label="Max LTV (%)">
              <input
                type="number"
                value={filters.maxLtv}
                onChange={(e) =>
                  onChange({ ...filters, maxLtv: e.target.value })
                }
                placeholder="e.g. 75"
                className="w-full h-8 px-2 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </FilterSection>
          </div>

          {/* Recourse */}
          <FilterSection label="Recourse">
            <div className="flex gap-2">
              {RECOURSE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() =>
                    onChange({
                      ...filters,
                      recourse: filters.recourse === r.value ? "" : r.value,
                    })
                  }
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                    filters.recourse === r.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export { emptyFilters };

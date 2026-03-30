"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import {
  PROPERTY_TYPES,
  LENDER_TYPES,
  LOAN_TYPES,
  US_STATES,
  STATE_NAMES,
  LENDER_STATUSES,
  RECOURSE_OPTIONS,
  RATE_TYPES,
  PREPAYMENT_OPTIONS,
  VALUE_ADD_OPTIONS,
  MARKET_TYPES,
  RELATIONSHIP_STRENGTHS,
  EQUITY_STRUCTURES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Lender } from "@/types/database";

type LenderFormData = Omit<Lender, "id" | "created_at" | "updated_at" | "total_deals" | "total_volume" | "last_deal_date">;

const defaultData: LenderFormData = {
  name: "",
  lender_type: "",
  website: "",
  hq_city: "",
  hq_state: "",
  parent_company: "",
  status: "active",
  property_types: [],
  loan_types: [],
  loan_size_min: null,
  loan_size_max: null,
  geography: [],
  market_types: [],
  max_ltv: null,
  min_dscr: null,
  min_debt_yield: null,
  rate_type: null,
  typical_rate_spread: "",
  typical_loan_term: null,
  io_available: null,
  prepayment: "",
  recourse: null,
  construction_lending: null,
  value_add_appetite: "",
  check_size_min: null,
  check_size_max: null,
  preferred_return_target: null,
  target_irr: null,
  hold_period: null,
  equity_structure: "",
  relationship_strength: null,
  internal_notes: "",
  tags: [],
  last_contact_date: null,
};

export function LenderForm({ lender }: { lender?: Lender }) {
  const [data, setData] = useState<LenderFormData>(
    lender ? { ...defaultData, ...lender } : defaultData
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const router = useRouter();
  const supabase = createClient();

  function update<K extends keyof LenderFormData>(key: K, val: LenderFormData[K]) {
    setData((prev) => ({ ...prev, [key]: val }));
  }

  function toggleArray(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !data.tags.includes(tag)) {
      update("tags", [...data.tags, tag]);
    }
    setTagInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name || !data.lender_type) {
      setError("Name and Lender Type are required.");
      return;
    }
    setError("");
    setSaving(true);

    // Clean empty strings to null for optional fields
    const payload = {
      ...data,
      website: data.website || null,
      hq_city: data.hq_city || null,
      hq_state: data.hq_state || null,
      parent_company: data.parent_company || null,
      typical_rate_spread: data.typical_rate_spread || null,
      prepayment: data.prepayment || null,
      value_add_appetite: data.value_add_appetite || null,
      equity_structure: data.equity_structure || null,
      internal_notes: data.internal_notes || null,
    };

    if (lender) {
      const { error: err } = await supabase
        .from("lenders")
        .update(payload)
        .eq("id", lender.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      router.push(`/lenders/${lender.id}`);
    } else {
      const { data: newLender, error: err } = await supabase
        .from("lenders")
        .insert(payload)
        .select("id")
        .single();
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
      router.push(`/lenders/${newLender.id}`);
    }
    router.refresh();
  }

  const isEquitySource = data.lender_type.includes("Equity") ||
    data.lender_type.includes("Family Office") ||
    data.lender_type.includes("Private Equity");

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Identity */}
      <FormSection title="Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Lender Name" required>
            <input
              type="text"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className="form-input"
              placeholder="e.g. JPMorgan Chase"
            />
          </FormField>
          <FormField label="Lender Type" required>
            <select
              value={data.lender_type}
              onChange={(e) => update("lender_type", e.target.value)}
              className="form-input"
            >
              <option value="">Select type...</option>
              {LENDER_TYPES.map((lt) => (
                <option key={lt} value={lt}>
                  {lt}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Website">
            <input
              type="url"
              value={data.website || ""}
              onChange={(e) => update("website", e.target.value)}
              className="form-input"
              placeholder="https://..."
            />
          </FormField>
          <FormField label="Status">
            <select
              value={data.status}
              onChange={(e) => update("status", e.target.value as LenderFormData["status"])}
              className="form-input"
            >
              {LENDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="HQ City">
            <input
              type="text"
              value={data.hq_city || ""}
              onChange={(e) => update("hq_city", e.target.value)}
              className="form-input"
              placeholder="New York"
            />
          </FormField>
          <FormField label="HQ State">
            <select
              value={data.hq_state || ""}
              onChange={(e) => update("hq_state", e.target.value)}
              className="form-input"
            >
              <option value="">Select state...</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {STATE_NAMES[st]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Parent Company">
            <input
              type="text"
              value={data.parent_company || ""}
              onChange={(e) => update("parent_company", e.target.value)}
              className="form-input"
              placeholder="If applicable"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Programs */}
      <FormSection title="Loan / Investment Programs">
        <FormField label="Property Types">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((pt) => (
              <button
                type="button"
                key={pt.value}
                onClick={() =>
                  update("property_types", toggleArray(data.property_types, pt.value))
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer",
                  data.property_types.includes(pt.value)
                    ? cn(pt.bgLight, pt.textColor, pt.borderColor)
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", pt.color)} />
                {pt.label}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Loan Types">
          <div className="flex flex-wrap gap-2">
            {LOAN_TYPES.map((lt) => (
              <button
                type="button"
                key={lt}
                onClick={() =>
                  update("loan_types", toggleArray(data.loan_types, lt))
                }
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                  data.loan_types.includes(lt)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                {lt}
              </button>
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Loan Size Minimum ($)">
            <input
              type="number"
              value={data.loan_size_min ?? ""}
              onChange={(e) =>
                update("loan_size_min", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 1000000"
            />
          </FormField>
          <FormField label="Loan Size Maximum ($)">
            <input
              type="number"
              value={data.loan_size_max ?? ""}
              onChange={(e) =>
                update("loan_size_max", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 50000000"
            />
          </FormField>
        </div>
        <FormField label="Geography">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() =>
                update("geography", toggleArray(data.geography, "national"))
              }
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                data.geography.includes("national")
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              National
            </button>
            {US_STATES.map((st) => (
              <button
                type="button"
                key={st}
                onClick={() =>
                  update("geography", toggleArray(data.geography, st))
                }
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer",
                  data.geography.includes(st)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
                title={STATE_NAMES[st]}
              >
                {st}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Market Types">
          <div className="flex gap-2">
            {MARKET_TYPES.map((mt) => (
              <button
                type="button"
                key={mt.value}
                onClick={() =>
                  update("market_types", toggleArray(data.market_types, mt.value))
                }
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                  data.market_types.includes(mt.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                {mt.label}
              </button>
            ))}
          </div>
        </FormField>
      </FormSection>

      {/* Underwriting */}
      <FormSection title="Underwriting Parameters (Debt)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Max LTV (%)">
            <input
              type="number"
              value={data.max_ltv ?? ""}
              onChange={(e) =>
                update("max_ltv", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 75"
              step="0.1"
            />
          </FormField>
          <FormField label="Min DSCR (x)">
            <input
              type="number"
              value={data.min_dscr ?? ""}
              onChange={(e) =>
                update("min_dscr", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 1.25"
              step="0.01"
            />
          </FormField>
          <FormField label="Min Debt Yield (%)">
            <input
              type="number"
              value={data.min_debt_yield ?? ""}
              onChange={(e) =>
                update("min_debt_yield", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 8"
              step="0.1"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Rate Type">
            <select
              value={data.rate_type || ""}
              onChange={(e) =>
                update("rate_type", (e.target.value || null) as LenderFormData["rate_type"])
              }
              className="form-input"
            >
              <option value="">Select...</option>
              {RATE_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Typical Rate or Spread">
            <input
              type="text"
              value={data.typical_rate_spread || ""}
              onChange={(e) => update("typical_rate_spread", e.target.value)}
              className="form-input"
              placeholder="e.g. SOFR + 250-300 bps"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Typical Loan Term (years)">
            <input
              type="number"
              value={data.typical_loan_term ?? ""}
              onChange={(e) =>
                update("typical_loan_term", e.target.value ? parseFloat(e.target.value) : null)
              }
              className="form-input"
              placeholder="e.g. 10"
            />
          </FormField>
          <FormField label="IO Available">
            <select
              value={data.io_available === null ? "" : data.io_available ? "yes" : "no"}
              onChange={(e) =>
                update("io_available", e.target.value === "" ? null : e.target.value === "yes")
              }
              className="form-input"
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormField>
          <FormField label="Prepayment">
            <select
              value={data.prepayment || ""}
              onChange={(e) => update("prepayment", e.target.value)}
              className="form-input"
            >
              <option value="">Select...</option>
              {PREPAYMENT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Recourse">
            <select
              value={data.recourse || ""}
              onChange={(e) =>
                update("recourse", (e.target.value || null) as LenderFormData["recourse"])
              }
              className="form-input"
            >
              <option value="">Select...</option>
              {RECOURSE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Construction Lending">
            <select
              value={data.construction_lending === null ? "" : data.construction_lending ? "yes" : "no"}
              onChange={(e) =>
                update("construction_lending", e.target.value === "" ? null : e.target.value === "yes")
              }
              className="form-input"
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormField>
          <FormField label="Value-Add Appetite">
            <select
              value={data.value_add_appetite || ""}
              onChange={(e) => update("value_add_appetite", e.target.value)}
              className="form-input"
            >
              <option value="">Select...</option>
              {VALUE_ADD_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Equity Parameters */}
      {isEquitySource && (
        <FormSection title="Equity Parameters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Check Size Min ($)">
              <input
                type="number"
                value={data.check_size_min ?? ""}
                onChange={(e) =>
                  update("check_size_min", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="form-input"
                placeholder="e.g. 5000000"
              />
            </FormField>
            <FormField label="Check Size Max ($)">
              <input
                type="number"
                value={data.check_size_max ?? ""}
                onChange={(e) =>
                  update("check_size_max", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="form-input"
                placeholder="e.g. 25000000"
              />
            </FormField>
            <FormField label="Preferred Return (%)">
              <input
                type="number"
                value={data.preferred_return_target ?? ""}
                onChange={(e) =>
                  update("preferred_return_target", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="form-input"
                placeholder="e.g. 8"
                step="0.1"
              />
            </FormField>
            <FormField label="Target IRR (%)">
              <input
                type="number"
                value={data.target_irr ?? ""}
                onChange={(e) =>
                  update("target_irr", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="form-input"
                placeholder="e.g. 15"
                step="0.1"
              />
            </FormField>
            <FormField label="Hold Period (years)">
              <input
                type="number"
                value={data.hold_period ?? ""}
                onChange={(e) =>
                  update("hold_period", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="form-input"
                placeholder="e.g. 5"
              />
            </FormField>
            <FormField label="Structure">
              <select
                value={data.equity_structure || ""}
                onChange={(e) => update("equity_structure", e.target.value)}
                className="form-input"
              >
                <option value="">Select...</option>
                {EQUITY_STRUCTURES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </FormSection>
      )}

      {/* Relationship */}
      <FormSection title="Relationship">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Relationship Strength">
            <div className="flex gap-2">
              {RELATIONSHIP_STRENGTHS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() =>
                    update("relationship_strength", data.relationship_strength === s ? null : s)
                  }
                  className={cn(
                    "h-9 w-9 rounded-md border text-sm font-medium transition-colors cursor-pointer",
                    data.relationship_strength === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Tags">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="form-input flex-1"
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" variant="outline" size="default" onClick={addTag}>
                  Add
                </Button>
              </div>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          update(
                            "tags",
                            data.tags.filter((t) => t !== tag)
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        </div>
        <FormField label="Internal Notes">
          <textarea
            value={data.internal_notes || ""}
            onChange={(e) => update("internal_notes", e.target.value)}
            className="form-input min-h-[100px] resize-y"
            placeholder="Any internal notes about this lender..."
          />
        </FormField>
      </FormSection>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="gap-1.5">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : lender ? "Update Lender" : "Create Lender"}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

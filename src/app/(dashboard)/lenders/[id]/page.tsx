"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PropertyTypeBadge } from "@/components/lenders/property-type-badge";
import { ArrowLeft, Pencil, Trash2, Globe, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lender, Contact } from "@/types/database";
import { RECOURSE_OPTIONS, RATE_TYPES } from "@/lib/constants";

export default function LenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lender, setLender] = useState<Lender | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const [lenderRes, contactsRes] = await Promise.all([
        supabase.from("lenders").select("*").eq("id", id).single(),
        supabase.from("contacts").select("*").eq("lender_id", id).order("last_name"),
      ]);
      setLender(lenderRes.data as Lender);
      setContacts((contactsRes.data as Contact[]) || []);
      setLoading(false);
    }
    fetch();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this lender?")) return;
    setDeleting(true);
    await supabase.from("lenders").delete().eq("id", id);
    router.push("/lenders");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!lender) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Lender not found.</p>
        <Button variant="outline" onClick={() => router.push("/lenders")}>
          Back to Lenders
        </Button>
      </div>
    );
  }

  const recourseLabel = RECOURSE_OPTIONS.find((r) => r.value === lender.recourse)?.label;
  const rateLabel = RATE_TYPES.find((r) => r.value === lender.rate_type)?.label;

  function formatCurrency(val: number | null) {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/lenders")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lenders
          </button>
          <h1 className="text-2xl font-bold">{lender.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{lender.lender_type}</span>
            {lender.hq_city && lender.hq_state && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {lender.hq_city}, {lender.hq_state}
              </span>
            )}
            {lender.website && (
              <a
                href={lender.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/lenders/${id}/edit`)}
            className="gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Types & Loan Types */}
          <Section title="Programs">
            <div className="space-y-3">
              <Field label="Property Types">
                <div className="flex flex-wrap gap-1.5">
                  {lender.property_types.length > 0
                    ? lender.property_types.map((pt) => (
                        <PropertyTypeBadge key={pt} value={pt} />
                      ))
                    : "-"}
                </div>
              </Field>
              <Field label="Loan Types">
                {lender.loan_types.length > 0
                  ? lender.loan_types.join(", ")
                  : "-"}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Loan Size Min">{formatCurrency(lender.loan_size_min)}</Field>
                <Field label="Loan Size Max">{formatCurrency(lender.loan_size_max)}</Field>
              </div>
              <Field label="Geography">
                {lender.geography.length > 0
                  ? lender.geography.includes("national")
                    ? "National"
                    : lender.geography.join(", ")
                  : "-"}
              </Field>
              <Field label="Market Types">
                {lender.market_types.length > 0
                  ? lender.market_types.join(", ")
                  : "-"}
              </Field>
            </div>
          </Section>

          {/* Underwriting */}
          <Section title="Underwriting Parameters">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Max LTV">{lender.max_ltv ? `${lender.max_ltv}%` : "-"}</Field>
              <Field label="Min DSCR">{lender.min_dscr ? `${lender.min_dscr}x` : "-"}</Field>
              <Field label="Min Debt Yield">{lender.min_debt_yield ? `${lender.min_debt_yield}%` : "-"}</Field>
              <Field label="Rate Type">{rateLabel || "-"}</Field>
              <Field label="Typical Rate/Spread">{lender.typical_rate_spread || "-"}</Field>
              <Field label="Loan Term">{lender.typical_loan_term ? `${lender.typical_loan_term} yrs` : "-"}</Field>
              <Field label="IO Available">{lender.io_available === null ? "-" : lender.io_available ? "Yes" : "No"}</Field>
              <Field label="Prepayment">{lender.prepayment || "-"}</Field>
              <Field label="Recourse">{recourseLabel || "-"}</Field>
              <Field label="Construction">{lender.construction_lending === null ? "-" : lender.construction_lending ? "Yes" : "No"}</Field>
              <Field label="Value-Add">{lender.value_add_appetite || "-"}</Field>
            </div>
          </Section>

          {/* Equity (show if applicable) */}
          {(lender.check_size_min || lender.check_size_max || lender.target_irr) && (
            <Section title="Equity Parameters">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Field label="Check Size Min">{formatCurrency(lender.check_size_min)}</Field>
                <Field label="Check Size Max">{formatCurrency(lender.check_size_max)}</Field>
                <Field label="Pref Return">{lender.preferred_return_target ? `${lender.preferred_return_target}%` : "-"}</Field>
                <Field label="Target IRR">{lender.target_irr ? `${lender.target_irr}%` : "-"}</Field>
                <Field label="Hold Period">{lender.hold_period ? `${lender.hold_period} yrs` : "-"}</Field>
                <Field label="Structure">{lender.equity_structure || "-"}</Field>
              </div>
            </Section>
          )}

          {/* Contacts at this lender */}
          <Section title={`Contacts (${contacts.length})`}>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts linked to this lender.</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
                    <div>
                      <span className="font-medium text-sm">
                        {c.first_name} {c.last_name}
                      </span>
                      {c.title && (
                        <span className="text-xs text-muted-foreground ml-2">{c.title}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.email || c.phone_mobile || ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Section title="Relationship">
            <div className="space-y-3">
              <Field label="Status">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium border capitalize",
                    lender.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : lender.status === "inactive"
                        ? "bg-gray-50 text-gray-500 border-gray-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  {lender.status}
                </span>
              </Field>
              <Field label="Relationship Strength">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        lender.relationship_strength && i <= lender.relationship_strength
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Last Contact">
                {lender.last_contact_date
                  ? new Date(lender.last_contact_date).toLocaleDateString()
                  : "Never"}
              </Field>
              <Field label="Total Deals">{lender.total_deals}</Field>
              <Field label="Total Volume">{formatCurrency(lender.total_volume)}</Field>
            </div>
          </Section>

          {lender.tags.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {lender.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {lender.internal_notes && (
            <Section title="Notes">
              <p className="text-sm whitespace-pre-wrap">{lender.internal_notes}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <h2 className="font-semibold text-sm mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

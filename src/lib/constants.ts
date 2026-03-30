// Property type categories with consistent color coding
export const PROPERTY_TYPES = [
  { value: "multifamily", label: "Multifamily", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50", borderColor: "border-blue-200" },
  { value: "office_retail", label: "Office / Retail / Mixed-Use", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50", borderColor: "border-purple-200" },
  { value: "industrial", label: "Industrial / Logistics", color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50", borderColor: "border-orange-200" },
  { value: "hospitality", label: "Hospitality / Specialty", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50", borderColor: "border-green-200" },
] as const;

export const PROPERTY_TYPE_MAP = Object.fromEntries(
  PROPERTY_TYPES.map((pt) => [pt.value, pt])
);

export const LENDER_TYPES = [
  "Bank (Community)",
  "Bank (Regional)",
  "Bank (National)",
  "Credit Union",
  "Life Insurance Company",
  "Debt Fund",
  "CMBS Shop",
  "Agency Lender (Fannie Mae DUS)",
  "Agency Lender (Freddie Mac Optigo)",
  "Agency Lender (HUD/FHA)",
  "Bridge Lender",
  "Hard Money / Private Lender",
  "Family Office",
  "Private Equity Fund",
  "Institutional Equity",
  "Crowdfunding Platform",
] as const;

export const LOAN_TYPES = [
  "Permanent",
  "Bridge",
  "Construction",
  "Mezzanine",
  "Preferred Equity",
  "Agency",
  "CMBS",
  "Hard Money",
  "SBA",
] as const;

export const LENDER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "prospect", label: "Prospect" },
] as const;

export const RECOURSE_OPTIONS = [
  { value: "full_recourse", label: "Full Recourse" },
  { value: "non_recourse", label: "Non-Recourse" },
  { value: "carve_outs", label: "Carve-outs Only" },
] as const;

export const RATE_TYPES = [
  { value: "fixed", label: "Fixed" },
  { value: "floating", label: "Floating" },
  { value: "both", label: "Both" },
] as const;

export const PREPAYMENT_OPTIONS = [
  "Defeasance",
  "Yield Maintenance",
  "Step-down",
  "Open",
  "Negotiable",
] as const;

export const VALUE_ADD_OPTIONS = [
  "Stabilized Only",
  "Light Value-Add",
  "Heavy Value-Add",
  "Development",
] as const;

export const MARKET_TYPES = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
] as const;

export const EQUITY_STRUCTURES = [
  "Common Equity",
  "Preferred Equity",
  "JV",
  "LP",
  "GP Co-Invest",
] as const;

export const RELATIONSHIP_STRENGTHS = [1, 2, 3, 4, 5] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
] as const;

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia",
};

// Deal pipeline stages
export const PIPELINE_STAGES = [
  { value: "lead", label: "Lead / Prospecting", order: 1 },
  { value: "engaged", label: "Engaged", order: 2 },
  { value: "pre_pitch", label: "Pre-Pitch", order: 3 },
  { value: "pitching", label: "Pitching / Quoting", order: 4 },
  { value: "term_sheet_received", label: "Term Sheet Received", order: 5 },
  { value: "term_sheet_negotiation", label: "Term Sheet Negotiation", order: 6 },
  { value: "application_dd", label: "Application & Due Diligence", order: 7 },
  { value: "commitment", label: "Commitment Letter", order: 8 },
  { value: "clear_to_close", label: "Clear to Close", order: 9 },
  { value: "funded", label: "Funded / Closed", order: 10 },
  { value: "inactive", label: "Inactive / Dead", order: 11 },
] as const;

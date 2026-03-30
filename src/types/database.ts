export type UserRole = "admin" | "broker";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type LenderStatus = "active" | "inactive" | "prospect";
export type RecourseType = "full_recourse" | "non_recourse" | "carve_outs";
export type RateType = "fixed" | "floating" | "both";

export interface Lender {
  id: string;
  // Identity
  name: string;
  lender_type: string;
  website: string | null;
  hq_city: string | null;
  hq_state: string | null;
  parent_company: string | null;
  status: LenderStatus;

  // Programs
  property_types: string[];
  loan_types: string[];
  loan_size_min: number | null;
  loan_size_max: number | null;
  geography: string[]; // state codes or ["national"]
  market_types: string[];

  // Underwriting (Debt)
  max_ltv: number | null;
  min_dscr: number | null;
  min_debt_yield: number | null;
  rate_type: RateType | null;
  typical_rate_spread: string | null;
  typical_loan_term: number | null;
  io_available: boolean | null;
  prepayment: string | null;
  recourse: RecourseType | null;
  construction_lending: boolean | null;
  value_add_appetite: string | null;

  // Equity Parameters
  check_size_min: number | null;
  check_size_max: number | null;
  preferred_return_target: number | null;
  target_irr: number | null;
  hold_period: number | null;
  equity_structure: string | null;

  // Relationship
  relationship_strength: number | null;
  internal_notes: string | null;
  tags: string[];
  last_contact_date: string | null;

  // Computed
  total_deals: number;
  total_volume: number;
  last_deal_date: string | null;

  created_at: string;
  updated_at: string;
}

export type ContactType =
  | "lender_contact"
  | "equity_source"
  | "borrower"
  | "sponsor"
  | "referral_source"
  | "attorney"
  | "other";

export type DecisionRole = "decision_maker" | "influencer" | "gatekeeper" | "user";

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  company: string | null;
  lender_id: string | null;
  contact_type: ContactType;
  phone_mobile: string | null;
  phone_office: string | null;
  email: string | null;
  linkedin_url: string | null;
  city: string | null;
  state: string | null;
  preferred_contact_method: string | null;
  decision_role: DecisionRole | null;
  relationship_strength: number | null;
  last_contact_date: string | null;
  next_followup_date: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "site_visit"
  | "lunch_dinner"
  | "linkedin"
  | "other";

export type ActivityOutcome = "positive" | "neutral" | "negative" | "no_answer";

export interface Activity {
  id: string;
  contact_id: string;
  deal_id: string | null;
  lender_id: string | null;
  activity_type: ActivityType;
  date: string;
  duration_minutes: number | null;
  summary: string;
  outcome: ActivityOutcome | null;
  next_steps: string | null;
  created_by: string;
  created_at: string;
}

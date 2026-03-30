-- CRE Capital Markets CRM - Initial Database Schema
-- Run this in your Supabase SQL Editor when you set up your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  role text not null default 'broker' check (role in ('admin', 'broker')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'broker')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- LENDERS
-- ============================================
create table public.lenders (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  name text not null,
  lender_type text not null,
  website text,
  hq_city text,
  hq_state text,
  parent_company text,
  status text not null default 'active' check (status in ('active', 'inactive', 'prospect')),

  -- Programs (arrays for multi-select)
  property_types text[] not null default '{}',
  loan_types text[] not null default '{}',
  loan_size_min numeric,
  loan_size_max numeric,
  geography text[] not null default '{}',
  market_types text[] not null default '{}',

  -- Underwriting (Debt)
  max_ltv numeric,
  min_dscr numeric,
  min_debt_yield numeric,
  rate_type text check (rate_type in ('fixed', 'floating', 'both')),
  typical_rate_spread text,
  typical_loan_term numeric,
  io_available boolean,
  prepayment text,
  recourse text check (recourse in ('full_recourse', 'non_recourse', 'carve_outs')),
  construction_lending boolean,
  value_add_appetite text,

  -- Equity Parameters
  check_size_min numeric,
  check_size_max numeric,
  preferred_return_target numeric,
  target_irr numeric,
  hold_period numeric,
  equity_structure text,

  -- Relationship
  relationship_strength integer check (relationship_strength between 1 and 5),
  internal_notes text,
  tags text[] not null default '{}',
  last_contact_date timestamptz,

  -- Computed (updated via triggers/functions)
  total_deals integer not null default 0,
  total_volume numeric not null default 0,
  last_deal_date timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for search performance
create index idx_lenders_property_types on public.lenders using gin(property_types);
create index idx_lenders_loan_types on public.lenders using gin(loan_types);
create index idx_lenders_geography on public.lenders using gin(geography);
create index idx_lenders_status on public.lenders(status);
create index idx_lenders_lender_type on public.lenders(lender_type);
create index idx_lenders_name on public.lenders(name);

-- ============================================
-- CONTACTS
-- ============================================
create table public.contacts (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  title text,
  company text,
  lender_id uuid references public.lenders(id) on delete set null,
  contact_type text not null default 'lender_contact'
    check (contact_type in ('lender_contact', 'equity_source', 'borrower', 'sponsor', 'referral_source', 'attorney', 'other')),
  phone_mobile text,
  phone_office text,
  email text,
  linkedin_url text,
  city text,
  state text,
  preferred_contact_method text check (preferred_contact_method in ('phone', 'email', 'linkedin', 'in_person')),
  decision_role text check (decision_role in ('decision_maker', 'influencer', 'gatekeeper', 'user')),
  relationship_strength integer check (relationship_strength between 1 and 5),
  last_contact_date timestamptz,
  next_followup_date date,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_contacts_lender_id on public.contacts(lender_id);
create index idx_contacts_contact_type on public.contacts(contact_type);
create index idx_contacts_next_followup on public.contacts(next_followup_date);

-- ============================================
-- ACTIVITIES
-- ============================================
create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid, -- will reference deals table later
  lender_id uuid references public.lenders(id) on delete set null,
  activity_type text not null
    check (activity_type in ('call', 'email', 'meeting', 'site_visit', 'lunch_dinner', 'linkedin', 'other')),
  date timestamptz not null default now(),
  duration_minutes integer,
  summary text not null,
  outcome text check (outcome in ('positive', 'neutral', 'negative', 'no_answer')),
  next_steps text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_activities_contact_id on public.activities(contact_id);
create index idx_activities_lender_id on public.activities(lender_id);
create index idx_activities_date on public.activities(date desc);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_lenders_updated_at
  before update on public.lenders
  for each row execute function public.update_updated_at();

create trigger update_contacts_updated_at
  before update on public.contacts
  for each row execute function public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.lenders enable row level security;
alter table public.contacts enable row level security;
alter table public.activities enable row level security;

-- Profiles: users can read all profiles, update their own
create policy "Users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Lenders: all authenticated users have full access (team shares data)
create policy "Authenticated users can view lenders"
  on public.lenders for select to authenticated using (true);

create policy "Authenticated users can insert lenders"
  on public.lenders for insert to authenticated with check (true);

create policy "Authenticated users can update lenders"
  on public.lenders for update to authenticated using (true);

create policy "Authenticated users can delete lenders"
  on public.lenders for delete to authenticated using (true);

-- Contacts: all authenticated users have full access
create policy "Authenticated users can view contacts"
  on public.contacts for select to authenticated using (true);

create policy "Authenticated users can insert contacts"
  on public.contacts for insert to authenticated with check (true);

create policy "Authenticated users can update contacts"
  on public.contacts for update to authenticated using (true);

create policy "Authenticated users can delete contacts"
  on public.contacts for delete to authenticated using (true);

-- Activities: all authenticated users have full access
create policy "Authenticated users can view activities"
  on public.activities for select to authenticated using (true);

create policy "Authenticated users can insert activities"
  on public.activities for insert to authenticated with check (true);

create policy "Authenticated users can update activities"
  on public.activities for update to authenticated using (true);

create policy "Authenticated users can delete activities"
  on public.activities for delete to authenticated using (true);

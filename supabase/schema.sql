-- ============================================================
-- Flowora — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES (extends auth.users) ───────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  avatar_url    text,
  plan          text not null default 'free',   -- 'free' | 'pro' | 'enterprise'
  account_status text not null default 'active', -- 'active' | 'suspended'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── CREATOR WORKSPACES ────────────────────────────────────────────────────
create table if not exists public.creator_workspaces (
  id            uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name          text not null default 'My Workspace',
  plan          text not null default 'free',
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create workspace on profile creation
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.creator_workspaces (owner_user_id, name)
  values (new.id, 'My Workspace')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ─── INSTAGRAM ACCOUNTS ────────────────────────────────────────────────────
create table if not exists public.instagram_accounts (
  id                  uuid primary key default uuid_generate_v4(),
  workspace_id        uuid not null references public.creator_workspaces(id) on delete cascade,
  instagram_user_id   text not null,
  username            text not null,
  status              text not null default 'active',
  permissions         text[] not null default '{}',
  access_token_enc    text,
  token_expires_at    timestamptz,
  connected_at        timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(workspace_id, instagram_user_id)
);

-- ─── CREATOR CAMPAIGNS ─────────────────────────────────────────────────────
create table if not exists public.creator_campaigns (
  id                    uuid primary key default uuid_generate_v4(),
  workspace_id          uuid not null references public.creator_workspaces(id) on delete cascade,
  instagram_account_id  uuid references public.instagram_accounts(id) on delete set null,
  name                  text not null,
  status                text not null default 'active',  -- 'active' | 'paused' | 'archived'
  trigger_type          text not null default 'comment_keyword',
  source_scope          text not null default 'any_post',
  keyword_match_type    text not null default 'contains',
  keywords              text[] not null default '{}',
  send_once_per_user    boolean not null default true,
  delay_seconds         integer not null default 0,
  slow_down_mode        boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── CAMPAIGN MESSAGES ─────────────────────────────────────────────────────
create table if not exists public.creator_campaign_messages (
  id            uuid primary key default uuid_generate_v4(),
  campaign_id   uuid not null references public.creator_campaigns(id) on delete cascade,
  message_text  text not null,
  cta_type      text not null default 'product_link',
  cta_url       text not null default '',
  created_at    timestamptz not null default now()
);

-- ─── CREATOR LEADS ─────────────────────────────────────────────────────────
create table if not exists public.creator_leads (
  id                    uuid primary key default uuid_generate_v4(),
  workspace_id          uuid not null references public.creator_workspaces(id) on delete cascade,
  campaign_id           uuid references public.creator_campaigns(id) on delete set null,
  instagram_username    text,
  name                  text,
  email                 text,
  phone                 text,
  source                text,
  tags                  text[] not null default '{}',
  created_at            timestamptz not null default now()
);

-- ─── AUTOMATION EVENTS ─────────────────────────────────────────────────────
create table if not exists public.automation_events (
  id                    uuid primary key default uuid_generate_v4(),
  workspace_id          uuid references public.creator_workspaces(id) on delete cascade,
  campaign_id           uuid references public.creator_campaigns(id) on delete set null,
  instagram_account_id  uuid references public.instagram_accounts(id) on delete set null,
  event_type            text not null,
  external_event_id     text,
  actor_instagram_id    text,
  actor_username        text,
  payload_json          text not null default '{}',
  status                text not null default 'pending',
  created_at            timestamptz not null default now(),
  processed_at          timestamptz
);

-- ─── MESSAGE DELIVERIES ────────────────────────────────────────────────────
create table if not exists public.message_deliveries (
  id                      uuid primary key default uuid_generate_v4(),
  workspace_id            uuid not null references public.creator_workspaces(id) on delete cascade,
  campaign_id             uuid not null references public.creator_campaigns(id) on delete cascade,
  recipient_instagram_id  text not null,
  recipient_username      text not null,
  message_text            text not null,
  status                  text not null default 'sent',
  created_at              timestamptz not null default now()
);

-- ─── CREATOR PRODUCTS ──────────────────────────────────────────────────────
create table if not exists public.creator_products (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.creator_workspaces(id) on delete cascade,
  title         text not null,
  type          text not null default 'digital',  -- 'digital' | 'course' | 'coaching' | 'template'
  description   text,
  price         numeric(10,2) not null default 0,
  sales_count   integer not null default 0,
  revenue       numeric(12,2) not null default 0,
  is_active     boolean not null default true,
  file_url      text,
  thumbnail_url text,
  created_at    timestamptz not null default now()
);

-- ─── CREATOR ORDERS ────────────────────────────────────────────────────────
create table if not exists public.creator_orders (
  id              uuid primary key default uuid_generate_v4(),
  workspace_id    uuid not null references public.creator_workspaces(id) on delete cascade,
  product_id      uuid not null references public.creator_products(id) on delete cascade,
  amount          numeric(10,2) not null,
  currency        text not null default 'INR',
  status          text not null default 'paid',  -- 'paid' | 'pending' | 'failed' | 'delivered'
  customer_name   text,
  customer_email  text,
  order_number    text,
  created_at      timestamptz not null default now()
);

-- ─── WORKFLOWS ─────────────────────────────────────────────────────────────
create table if not exists public.workflows (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.creator_workspaces(id) on delete cascade,
  name          text not null,
  description   text,
  status        text not null default 'draft',  -- 'draft' | 'active' | 'paused' | 'archived'
  trigger_type  text not null,
  trigger_config jsonb,
  last_run_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── ADMIN SETTINGS ────────────────────────────────────────────────────────
create table if not exists public.admin_settings (
  id       uuid primary key default uuid_generate_v4(),
  key      text not null unique,
  value    text not null,
  category text not null default 'general'
);

-- ─── SUPPORT TICKETS ───────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  subject     text not null,
  category    text not null default 'other',
  priority    text not null default 'medium',
  description text not null,
  status      text not null default 'open',
  replies     jsonb not null default '[]'::jsonb,
  assigned_to text,
  resolved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.creator_workspaces enable row level security;
alter table public.instagram_accounts enable row level security;
alter table public.creator_campaigns enable row level security;
alter table public.creator_campaign_messages enable row level security;
alter table public.creator_leads enable row level security;
alter table public.automation_events enable row level security;
alter table public.message_deliveries enable row level security;
alter table public.creator_products enable row level security;
alter table public.creator_orders enable row level security;
alter table public.workflows enable row level security;
alter table public.support_tickets enable row level security;

-- Profiles: users can only read/update their own profile
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

-- Workspaces: users can only access their own workspaces
create policy "workspaces_owner" on public.creator_workspaces
  for all using (auth.uid() = owner_user_id);

-- Instagram accounts: scoped to workspace owner
create policy "ig_accounts_owner" on public.instagram_accounts
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Campaigns: scoped to workspace owner
create policy "campaigns_owner" on public.creator_campaigns
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Campaign messages: scoped to workspace owner
create policy "campaign_messages_owner" on public.creator_campaign_messages
  for all using (
    campaign_id in (
      select id from public.creator_campaigns
      where workspace_id in (
        select id from public.creator_workspaces where owner_user_id = auth.uid()
      )
    )
  );

-- Leads: scoped to workspace owner
create policy "leads_owner" on public.creator_leads
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Automation events: scoped to workspace owner
create policy "automation_events_owner" on public.automation_events
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Message deliveries: scoped to workspace owner
create policy "deliveries_owner" on public.message_deliveries
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Products: scoped to workspace owner
create policy "products_owner" on public.creator_products
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Orders: scoped to workspace owner
create policy "orders_owner" on public.creator_orders
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Workflows: scoped to workspace owner
create policy "workflows_owner" on public.workflows
  for all using (
    workspace_id in (
      select id from public.creator_workspaces where owner_user_id = auth.uid()
    )
  );

-- Support tickets: scoped to user
create policy "tickets_owner" on public.support_tickets
  for all using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES (for performance)
-- ═══════════════════════════════════════════════════════════════════
create index if not exists idx_workspaces_owner on public.creator_workspaces(owner_user_id);
create index if not exists idx_campaigns_workspace on public.creator_campaigns(workspace_id);
create index if not exists idx_leads_workspace on public.creator_leads(workspace_id);
create index if not exists idx_leads_campaign on public.creator_leads(campaign_id);
create index if not exists idx_deliveries_workspace on public.message_deliveries(workspace_id);
create index if not exists idx_deliveries_campaign on public.message_deliveries(campaign_id);
create index if not exists idx_products_workspace on public.creator_products(workspace_id);
create index if not exists idx_orders_workspace on public.creator_orders(workspace_id);
create index if not exists idx_events_workspace on public.automation_events(workspace_id);
create index if not exists idx_workflows_workspace on public.workflows(workspace_id);

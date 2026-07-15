create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references public.families(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) > 0),
  first_name text,
  role text not null check (role in ('parent', 'child')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.child_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  qr_token uuid unique not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  child_account_id uuid not null references public.child_accounts(id) on delete restrict,
  amount numeric(12, 2) not null check (amount <> 0),
  transaction_type text not null check (transaction_type in ('credit', 'debit', 'reward', 'adjustment', 'saving')),
  description text not null check (length(trim(description)) > 0),
  balance_before numeric(12, 2) not null check (balance_before >= 0),
  balance_after numeric(12, 2) not null check (balance_after >= 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  cost numeric(12, 2) not null check (cost > 0),
  icon text,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards(id) on delete restrict,
  child_account_id uuid not null references public.child_accounts(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  comment text
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  child_account_id uuid not null references public.child_accounts(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  check (current_amount <= target_amount)
);

create index if not exists idx_families_created_by on public.families(created_by);
create index if not exists idx_profiles_family_id on public.profiles(family_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_child_accounts_profile_id on public.child_accounts(profile_id);
create index if not exists idx_child_accounts_qr_token on public.child_accounts(qr_token);
create index if not exists idx_transactions_child_created_at on public.transactions(child_account_id, created_at desc);
create index if not exists idx_transactions_created_by on public.transactions(created_by);
create index if not exists idx_rewards_family_active on public.rewards(family_id, is_active);
create index if not exists idx_reward_claims_child_status on public.reward_claims(child_account_id, status);
create index if not exists idx_reward_claims_reward_status on public.reward_claims(reward_id, status);
create index if not exists idx_savings_goals_child_status on public.savings_goals(child_account_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_profile_security_column_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null and (
    new.id is distinct from old.id or
    new.role is distinct from old.role or
    new.family_id is distinct from old.family_id
  ) then
    raise exception 'Profile security fields cannot be changed from the client';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_direct_balance_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.balance is distinct from old.balance and current_setting('app.kidbank_balance_rpc', true) <> 'on' then
    raise exception 'Balances must be changed through create_child_transaction';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_transaction_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'Transactions are immutable';
end;
$$;

drop trigger if exists trg_families_updated_at on public.families;
create trigger trg_families_updated_at
before update on public.families
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_security_columns on public.profiles;
create trigger trg_profiles_security_columns
before update on public.profiles
for each row execute function public.prevent_profile_security_column_change();

drop trigger if exists trg_child_accounts_updated_at on public.child_accounts;
create trigger trg_child_accounts_updated_at
before update on public.child_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_child_accounts_balance_guard on public.child_accounts;
create trigger trg_child_accounts_balance_guard
before update on public.child_accounts
for each row execute function public.prevent_direct_balance_change();

drop trigger if exists trg_transactions_immutable_update on public.transactions;
create trigger trg_transactions_immutable_update
before update on public.transactions
for each row execute function public.prevent_transaction_mutation();

drop trigger if exists trg_transactions_immutable_delete on public.transactions;
create trigger trg_transactions_immutable_delete
before delete on public.transactions
for each row execute function public.prevent_transaction_mutation();

drop trigger if exists trg_rewards_updated_at on public.rewards;
create trigger trg_rewards_updated_at
before update on public.rewards
for each row execute function public.set_updated_at();

drop trigger if exists trg_savings_goals_updated_at on public.savings_goals;
create trigger trg_savings_goals_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.family_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_child_account_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select ca.id
  from public.child_accounts ca
  join public.profiles p on p.id = ca.profile_id
  where p.id = auth.uid()
    and p.role = 'child'
    and p.is_active = true
  limit 1;
$$;

alter table public.families enable row level security;
alter table public.profiles enable row level security;
alter table public.child_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_claims enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists "families_select_own" on public.families;
create policy "families_select_own"
on public.families
for select
to authenticated
using (id = public.current_family_id());

drop policy if exists "families_insert_creator" on public.families;
create policy "families_insert_creator"
on public.families
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "families_update_parent_own" on public.families;
create policy "families_update_parent_own"
on public.families
for update
to authenticated
using (id = public.current_family_id() and public.current_profile_role() = 'parent')
with check (id = public.current_family_id() and public.current_profile_role() = 'parent');

drop policy if exists "profiles_select_family_or_self" on public.profiles;
create policy "profiles_select_family_or_self"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or (
    public.current_profile_role() = 'parent'
    and family_id = public.current_family_id()
  )
);

drop policy if exists "profiles_insert_parent_family_or_self" on public.profiles;
create policy "profiles_insert_parent_family_or_self"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  or (
    public.current_profile_role() = 'parent'
    and family_id = public.current_family_id()
  )
);

drop policy if exists "profiles_update_parent_family_or_self" on public.profiles;
create policy "profiles_update_parent_family_or_self"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or (
    public.current_profile_role() = 'parent'
    and family_id = public.current_family_id()
  )
)
with check (
  id = auth.uid()
  or (
    public.current_profile_role() = 'parent'
    and family_id = public.current_family_id()
  )
);

drop policy if exists "child_accounts_select_family_or_self" on public.child_accounts;
create policy "child_accounts_select_family_or_self"
on public.child_accounts
for select
to authenticated
using (
  id = public.current_child_account_id()
  or (
    public.current_profile_role() = 'parent'
    and exists (
      select 1
      from public.profiles p
      where p.id = child_accounts.profile_id
        and p.family_id = public.current_family_id()
    )
  )
);

drop policy if exists "child_accounts_insert_parent_family" on public.child_accounts;
create policy "child_accounts_insert_parent_family"
on public.child_accounts
for insert
to authenticated
with check (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.profiles p
    where p.id = child_accounts.profile_id
      and p.family_id = public.current_family_id()
      and p.role = 'child'
  )
);

drop policy if exists "child_accounts_update_parent_family_metadata" on public.child_accounts;
create policy "child_accounts_update_parent_family_metadata"
on public.child_accounts
for update
to authenticated
using (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.profiles p
    where p.id = child_accounts.profile_id
      and p.family_id = public.current_family_id()
  )
)
with check (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.profiles p
    where p.id = child_accounts.profile_id
      and p.family_id = public.current_family_id()
  )
);

drop policy if exists "transactions_select_family_or_self" on public.transactions;
create policy "transactions_select_family_or_self"
on public.transactions
for select
to authenticated
using (
  child_account_id = public.current_child_account_id()
  or (
    public.current_profile_role() = 'parent'
    and exists (
      select 1
      from public.child_accounts ca
      join public.profiles p on p.id = ca.profile_id
      where ca.id = transactions.child_account_id
        and p.family_id = public.current_family_id()
    )
  )
);

drop policy if exists "rewards_select_family" on public.rewards;
create policy "rewards_select_family"
on public.rewards
for select
to authenticated
using (
  family_id = public.current_family_id()
  and (
    public.current_profile_role() = 'parent'
    or is_active = true
  )
);

drop policy if exists "rewards_insert_parent_family" on public.rewards;
create policy "rewards_insert_parent_family"
on public.rewards
for insert
to authenticated
with check (
  public.current_profile_role() = 'parent'
  and family_id = public.current_family_id()
  and created_by = auth.uid()
);

drop policy if exists "rewards_update_parent_family" on public.rewards;
create policy "rewards_update_parent_family"
on public.rewards
for update
to authenticated
using (
  public.current_profile_role() = 'parent'
  and family_id = public.current_family_id()
)
with check (
  public.current_profile_role() = 'parent'
  and family_id = public.current_family_id()
);

drop policy if exists "reward_claims_select_family_or_self" on public.reward_claims;
create policy "reward_claims_select_family_or_self"
on public.reward_claims
for select
to authenticated
using (
  child_account_id = public.current_child_account_id()
  or (
    public.current_profile_role() = 'parent'
    and exists (
      select 1
      from public.child_accounts ca
      join public.profiles p on p.id = ca.profile_id
      where ca.id = reward_claims.child_account_id
        and p.family_id = public.current_family_id()
    )
  )
);

drop policy if exists "reward_claims_insert_child_self" on public.reward_claims;
create policy "reward_claims_insert_child_self"
on public.reward_claims
for insert
to authenticated
with check (
  child_account_id = public.current_child_account_id()
  and status = 'pending'
  and exists (
    select 1
    from public.rewards r
    where r.id = reward_claims.reward_id
      and r.family_id = public.current_family_id()
      and r.is_active = true
  )
);

drop policy if exists "reward_claims_update_parent_family" on public.reward_claims;
create policy "reward_claims_update_parent_family"
on public.reward_claims
for update
to authenticated
using (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.id = reward_claims.child_account_id
      and p.family_id = public.current_family_id()
  )
)
with check (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.id = reward_claims.child_account_id
      and p.family_id = public.current_family_id()
  )
);

drop policy if exists "savings_goals_select_family_or_self" on public.savings_goals;
create policy "savings_goals_select_family_or_self"
on public.savings_goals
for select
to authenticated
using (
  child_account_id = public.current_child_account_id()
  or (
    public.current_profile_role() = 'parent'
    and exists (
      select 1
      from public.child_accounts ca
      join public.profiles p on p.id = ca.profile_id
      where ca.id = savings_goals.child_account_id
        and p.family_id = public.current_family_id()
    )
  )
);

drop policy if exists "savings_goals_insert_parent_family" on public.savings_goals;
create policy "savings_goals_insert_parent_family"
on public.savings_goals
for insert
to authenticated
with check (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.id = savings_goals.child_account_id
      and p.family_id = public.current_family_id()
  )
);

drop policy if exists "savings_goals_update_parent_family" on public.savings_goals;
create policy "savings_goals_update_parent_family"
on public.savings_goals
for update
to authenticated
using (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.id = savings_goals.child_account_id
      and p.family_id = public.current_family_id()
  )
)
with check (
  public.current_profile_role() = 'parent'
  and exists (
    select 1
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.id = savings_goals.child_account_id
      and p.family_id = public.current_family_id()
  )
);

create or replace function public.create_child_transaction(
  p_child_account_id uuid,
  p_amount numeric,
  p_transaction_type text,
  p_description text
)
returns public.transactions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_family_id uuid;
  v_actor_role text;
  v_balance_before numeric(12, 2);
  v_signed_amount numeric(12, 2);
  v_balance_after numeric(12, 2);
  v_transaction public.transactions;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.family_id, p.role
  into v_actor_family_id, v_actor_role
  from public.profiles p
  where p.id = v_actor_id
    and p.is_active = true;

  if v_actor_role is distinct from 'parent' or v_actor_family_id is null then
    raise exception 'Only active parents can create child transactions';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be greater than zero';
  end if;

  if p_transaction_type not in ('credit', 'debit', 'reward', 'adjustment', 'saving') then
    raise exception 'Invalid transaction type';
  end if;

  if p_description is null or length(trim(p_description)) = 0 then
    raise exception 'Description is required';
  end if;

  select ca.balance
  into v_balance_before
  from public.child_accounts ca
  join public.profiles child_profile on child_profile.id = ca.profile_id
  where ca.id = p_child_account_id
    and child_profile.family_id = v_actor_family_id
    and child_profile.role = 'child'
    and child_profile.is_active = true
  for update of ca;

  if v_balance_before is null then
    raise exception 'Child account not found for this family';
  end if;

  v_signed_amount := case
    when p_transaction_type in ('credit', 'adjustment') then p_amount
    else -p_amount
  end;
  v_balance_after := v_balance_before + v_signed_amount;

  if v_balance_after < 0 then
    raise exception 'Insufficient child balance';
  end if;

  insert into public.transactions (
    child_account_id,
    amount,
    transaction_type,
    description,
    balance_before,
    balance_after,
    created_by
  )
  values (
    p_child_account_id,
    v_signed_amount,
    p_transaction_type,
    trim(p_description),
    v_balance_before,
    v_balance_after,
    v_actor_id
  )
  returning * into v_transaction;

  perform set_config('app.kidbank_balance_rpc', 'on', true);

  update public.child_accounts
  set balance = v_balance_after
  where id = p_child_account_id;

  return v_transaction;
end;
$$;

create or replace function public.find_child_by_qr_token(p_qr_token uuid)
returns table (
  child_account_id uuid,
  profile_id uuid,
  first_name text,
  full_name text,
  avatar_url text,
  balance numeric
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_family_id uuid;
  v_actor_role text;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.family_id, p.role
  into v_actor_family_id, v_actor_role
  from public.profiles p
  where p.id = v_actor_id
    and p.is_active = true;

  if v_actor_role is distinct from 'parent' or v_actor_family_id is null then
    raise exception 'Only active parents can scan QR codes';
  end if;

  return query
    select ca.id, p.id, p.first_name, p.full_name, p.avatar_url, ca.balance
    from public.child_accounts ca
    join public.profiles p on p.id = ca.profile_id
    where ca.qr_token = p_qr_token
      and p.family_id = v_actor_family_id
      and p.role = 'child'
      and p.is_active = true
    limit 1;
end;
$$;

revoke execute on function public.current_profile_role() from public;
revoke execute on function public.current_family_id() from public;
revoke execute on function public.current_child_account_id() from public;
revoke execute on function public.create_child_transaction(uuid, numeric, text, text) from public;
revoke execute on function public.find_child_by_qr_token(uuid) from public;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_family_id() to authenticated;
grant execute on function public.current_child_account_id() to authenticated;
grant execute on function public.create_child_transaction(uuid, numeric, text, text) to authenticated;
grant execute on function public.find_child_by_qr_token(uuid) to authenticated;

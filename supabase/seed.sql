do $$
declare
  v_family_id uuid := '11111111-1111-4111-8111-111111111111';
  v_parent_id uuid;
  v_lucas_id uuid;
  v_emma_id uuid;
  v_noah_id uuid;
  v_lucas_account_id uuid := '22222222-2222-4222-8222-222222222222';
  v_emma_account_id uuid := '33333333-3333-4333-8333-333333333333';
  v_noah_account_id uuid := '44444444-4444-4444-8444-444444444444';
begin
  select id into v_parent_id from auth.users where email = 'parent@kidbank.local';
  select id into v_lucas_id from auth.users where email = 'child@kidbank.local';
  select id into v_emma_id from auth.users where email = 'emma@kidbank.local';
  select id into v_noah_id from auth.users where email = 'noah@kidbank.local';

  if v_parent_id is null or v_lucas_id is null or v_emma_id is null or v_noah_id is null then
    raise exception 'Create Auth users first: parent@kidbank.local, child@kidbank.local, emma@kidbank.local, noah@kidbank.local';
  end if;

  insert into public.families (id, name, created_by)
  values (v_family_id, 'Famille Martin', v_parent_id)
  on conflict (id) do update
  set name = excluded.name;

  insert into public.profiles (id, family_id, full_name, first_name, role, avatar_url, is_active)
  values
    (v_parent_id, v_family_id, 'Sophie Martin', 'Sophie', 'parent', null, true),
    (v_lucas_id, v_family_id, 'Lucas Martin', 'Lucas', 'child', null, true),
    (v_emma_id, v_family_id, 'Emma Martin', 'Emma', 'child', null, true),
    (v_noah_id, v_family_id, 'Noah Martin', 'Noah', 'child', null, true)
  on conflict (id) do update
  set full_name = excluded.full_name,
      first_name = excluded.first_name,
      avatar_url = excluded.avatar_url,
      is_active = excluded.is_active;

  insert into public.child_accounts (id, profile_id, balance, qr_token)
  values
    (v_lucas_account_id, v_lucas_id, 125, '6d2f2f34-aed4-4be1-97a7-5f4b2b8d3b90'),
    (v_emma_account_id, v_emma_id, 80, 'af4a9797-9e7c-4e95-8a8b-f507d5f47ff4'),
    (v_noah_account_id, v_noah_id, 45, '4c60fce7-a7ad-4d0d-881d-a34c7e21492d')
  on conflict (id) do update
  set qr_token = excluded.qr_token;

  insert into public.rewards (id, family_id, name, description, cost, icon, is_active, created_by)
  values
    ('55555555-0001-4555-8555-555555555555', v_family_id, '30 minutes de jeu video', 'Un bonus de temps de jeu valide par les parents.', 20, 'sports_esports', true, v_parent_id),
    ('55555555-0002-4555-8555-555555555555', v_family_id, 'Choisir le dessert', 'Choisir le dessert du prochain repas en famille.', 15, 'icecream', true, v_parent_id),
    ('55555555-0003-4555-8555-555555555555', v_family_id, 'Sortie au cinema', 'Une sortie cinema avec un parent.', 80, 'theaters', true, v_parent_id),
    ('55555555-0004-4555-8555-555555555555', v_family_id, 'Petit cadeau', 'Un petit cadeau choisi dans la liste familiale.', 120, 'redeem', true, v_parent_id),
    ('55555555-0005-4555-8555-555555555555', v_family_id, 'Soiree film', 'Choisir le film du vendredi soir.', 35, 'movie', false, v_parent_id)
  on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      cost = excluded.cost,
      icon = excluded.icon,
      is_active = excluded.is_active;

  insert into public.savings_goals (id, child_account_id, name, description, target_amount, current_amount, target_date, status)
  values
    ('66666666-0001-4666-8666-666666666666', v_lucas_account_id, 'Nouveau velo', 'Un velo bleu pour les sorties du week-end.', 180, 95, '2026-09-15', 'active'),
    ('66666666-0002-4666-8666-666666666666', v_lucas_account_id, 'Grande boite de briques', 'Economiser pour une grande construction.', 75, 75, '2026-08-01', 'completed'),
    ('66666666-0003-4666-8666-666666666666', v_emma_account_id, 'Jeu video', 'Un jeu coop a choisir en famille.', 90, 52, '2026-08-20', 'active'),
    ('66666666-0004-4666-8666-666666666666', v_noah_account_id, 'Casque audio', 'Un casque solide pour les trajets.', 120, 36, '2026-10-01', 'active')
  on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      target_amount = excluded.target_amount,
      current_amount = excluded.current_amount,
      target_date = excluded.target_date,
      status = excluded.status;

  insert into public.transactions (
    id,
    child_account_id,
    amount,
    transaction_type,
    description,
    balance_before,
    balance_after,
    created_by,
    created_at
  )
  values
    ('77777777-0001-4777-8777-777777777777', v_lucas_account_id, 20, 'credit', 'Aide au jardin', 105, 125, v_parent_id, '2026-07-14T17:30:00Z'),
    ('77777777-0002-4777-8777-777777777777', v_noah_account_id, -10, 'debit', 'Petit cadeau', 55, 45, v_parent_id, '2026-07-13T15:15:00Z'),
    ('77777777-0003-4777-8777-777777777777', v_emma_account_id, 15, 'credit', 'Lecture terminee', 65, 80, v_parent_id, '2026-07-12T18:05:00Z'),
    ('77777777-0004-4777-8777-777777777777', v_lucas_account_id, -20, 'reward', '30 minutes de jeu video', 125, 105, v_parent_id, '2026-07-10T16:40:00Z'),
    ('77777777-0005-4777-8777-777777777777', v_emma_account_id, -12, 'saving', 'Versement objectif jeu video', 77, 65, v_parent_id, '2026-07-09T19:10:00Z')
  on conflict (id) do nothing;

  insert into public.reward_claims (id, reward_id, child_account_id, status, requested_at, reviewed_at, reviewed_by, comment)
  values
    ('88888888-0001-4888-8888-888888888888', '55555555-0001-4555-8555-555555555555', v_lucas_account_id, 'pending', '2026-07-14T19:20:00Z', null, null, null),
    ('88888888-0002-4888-8888-888888888888', '55555555-0002-4555-8555-555555555555', v_emma_account_id, 'approved', '2026-07-12T13:15:00Z', '2026-07-12T14:00:00Z', v_parent_id, null),
    ('88888888-0003-4888-8888-888888888888', '55555555-0001-4555-8555-555555555555', v_noah_account_id, 'rejected', '2026-07-11T17:40:00Z', '2026-07-11T18:05:00Z', v_parent_id, 'On revoit ca demain.')
  on conflict (id) do update
  set status = excluded.status,
      reviewed_at = excluded.reviewed_at,
      reviewed_by = excluded.reviewed_by,
      comment = excluded.comment;
end;
$$;

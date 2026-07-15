# KidBank Supabase

## Variables frontend

Copiez `.env.example` vers `.env.local`, puis renseignez uniquement la cle `anon`:

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

Ne mettez jamais la cle `service_role` dans React.

## Migration

Depuis un projet Supabase lie avec la CLI:

```bash
supabase db push
```

Ou appliquez le fichier `supabase/migrations/001_initial_schema.sql` dans l'editeur SQL Supabase.

La migration cree les tables, contraintes, triggers, politiques RLS et RPC:

- `create_child_transaction`
- `find_child_by_qr_token`

## Utilisateurs Auth de developpement

Avant `supabase/seed.sql`, creez ces utilisateurs dans Supabase Auth:

- `parent@kidbank.local`
- `child@kidbank.local`
- `emma@kidbank.local`
- `noah@kidbank.local`

Utilisez des mots de passe locaux temporaires et ne les stockez pas dans le depot.

Ensuite, lancez `supabase/seed.sql`. Le seed lit les UUID dans `auth.users`, puis cree les profils, comptes enfants, transactions, recompenses et objectifs.

## Tests RLS manuels

1. Connectez-vous avec `parent@kidbank.local`.
2. Verifiez que les enfants, transactions, recompenses et objectifs de la famille sont visibles.
3. Connectez-vous avec `child@kidbank.local`.
4. Verifiez que seuls le profil, le compte, les transactions, objectifs et demandes de Lucas sont visibles.
5. Tentez une mise a jour directe de `child_accounts.balance`: elle doit echouer.
6. Tentez de modifier une transaction: elle doit echouer.
7. Appelez `create_child_transaction` en parent: la transaction doit etre creee et le solde mis a jour.
8. Appelez `find_child_by_qr_token` avec le token d'une autre famille: aucun enfant ne doit etre retourne.

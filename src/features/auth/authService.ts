import type { Session } from '@supabase/supabase-js'
import { family, getDemoUserByEmail } from '../../mocks/currentUser'
import type { UserRole } from '../../types/user'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { throwFrenchError } from '../../utils/errors'

export type AuthProfile = {
  id: string
  familyId: string | null
  fullName: string
  firstName: string | null
  role: UserRole
  avatarUrl: string | null
  isActive: boolean
}

export type AuthStateSnapshot = {
  session: Session | null
  profile: AuthProfile | null
  error: string | null
}

function mapProfileRow(row: {
  id: string
  family_id: string | null
  full_name: string
  first_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
}): AuthProfile {
  return {
    id: row.id,
    familyId: row.family_id,
    fullName: row.full_name,
    firstName: row.first_name,
    role: row.role,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
  }
}

function demoProfileFromEmail(email: string): AuthProfile | null {
  const demoUser = getDemoUserByEmail(email)

  if (!demoUser) {
    return null
  }

  return {
    id: demoUser.id,
    familyId: family.id,
    fullName: demoUser.fullName,
    firstName: demoUser.firstName,
    role: demoUser.role,
    avatarUrl: null,
    isActive: demoUser.isActive,
  }
}

export async function fetchCurrentProfile(userId: string): Promise<AuthProfile | null> {
  if (!supabase) {
    const email = window.sessionStorage.getItem('kidbank-demo-email')
    return email ? demoProfileFromEmail(email) : null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, family_id, full_name, first_name, role, avatar_url, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throwFrenchError(error, 'Impossible de charger votre profil KidBank.')
  }

  return data ? mapProfileRow(data) : null
}

export async function getInitialAuthState(): Promise<AuthStateSnapshot> {
  if (!supabase) {
    const email = window.sessionStorage.getItem('kidbank-demo-email')
    const profile = email ? demoProfileFromEmail(email) : null

    return {
      session: null,
      profile,
      error: isSupabaseConfigured ? null : 'Mode mock: variables Supabase absentes.',
    }
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throwFrenchError(error, 'Impossible de restaurer la session.')
  }

  const profile = data.session?.user.id ? await fetchCurrentProfile(data.session.user.id) : null

  return {
    session: data.session,
    profile,
    error: data.session && !profile ? 'Profil KidBank incomplet.' : null,
  }
}

export async function signInWithEmailPassword(email: string, password: string): Promise<AuthStateSnapshot> {
  if (!supabase) {
    const profile = demoProfileFromEmail(email)

    if (!profile || password.trim().length === 0) {
      throw new Error('Utilisez parent@kidbank.local ou child@kidbank.local avec un mot de passe non vide.')
    }

    window.sessionStorage.setItem('kidbank-demo-email', email.trim().toLowerCase())
    window.sessionStorage.setItem('kidbank-demo-role', profile.role)

    return {
      session: null,
      profile,
      error: 'Mode mock: variables Supabase absentes.',
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throwFrenchError(error, 'Connexion impossible.')
  }

  const profile = data.user?.id ? await fetchCurrentProfile(data.user.id) : null

  return {
    session: data.session,
    profile,
    error: data.user && !profile ? 'Profil KidBank incomplet.' : null,
  }
}

export async function signOutUser() {
  window.sessionStorage.removeItem('kidbank-demo-email')
  window.sessionStorage.removeItem('kidbank-demo-role')

  if (!supabase) {
    return
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    throwFrenchError(error, 'Deconnexion impossible.')
  }
}

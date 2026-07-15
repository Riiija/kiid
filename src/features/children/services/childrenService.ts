import { getMockChild, getMockChildByQrToken, listMockChildren } from '../../../mocks/mockRuntimeStore'
import type { ChildAccount } from '../../../types/child'
import { requireSupabaseClient, supabase } from '../../../lib/supabase'
import { throwFrenchError } from '../../../utils/errors'

type ChildAccountRow = {
  id: string
  profile_id: string
  balance: number
  qr_token: string
  profiles: {
    family_id: string | null
    full_name: string
    first_name: string | null
    avatar_url: string | null
    is_active: boolean
  } | null
}

type QrChildRow = {
  child_account_id: string
  profile_id: string
  first_name: string | null
  full_name: string
  avatar_url: string | null
  balance: number
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('')
}

function mapChildRow(row: ChildAccountRow): ChildAccount {
  const firstName = row.profiles?.first_name ?? row.profiles?.full_name.split(' ')[0] ?? 'Enfant'

  return {
    id: row.id,
    profileId: row.profile_id,
    familyId: row.profiles?.family_id ?? '',
    firstName,
    fullName: row.profiles?.full_name ?? firstName,
    avatarInitials: initialsFromName(firstName),
    avatarColor: '#6D5DFB',
    balance: Number(row.balance),
    weeklyDelta: 0,
    qrToken: row.qr_token,
    isActive: row.profiles?.is_active ?? false,
    canEditAvatar: true,
    mainGoalId: '',
  }
}

export async function listChildren(): Promise<ChildAccount[]> {
  if (!supabase) {
    return listMockChildren()
  }

  const { data, error } = await supabase
    .from('child_accounts')
    .select('id, profile_id, balance, qr_token, profiles(family_id, full_name, first_name, avatar_url, is_active)')
    .order('created_at', { ascending: true })
    .returns<ChildAccountRow[]>()

  if (error) {
    throwFrenchError(error, 'Impossible de charger les enfants.')
  }

  return data.map(mapChildRow)
}

export async function getChild(childId: string): Promise<ChildAccount | null> {
  if (!supabase) {
    return getMockChild(childId)
  }

  const { data, error } = await supabase
    .from('child_accounts')
    .select('id, profile_id, balance, qr_token, profiles(family_id, full_name, first_name, avatar_url, is_active)')
    .eq('id', childId)
    .maybeSingle()
    .returns<ChildAccountRow | null>()

  if (error) {
    throwFrenchError(error, "Impossible de charger le compte enfant.")
  }

  return data ? mapChildRow(data) : null
}

export async function findChildByQrToken(qrToken: string): Promise<ChildAccount | null> {
  if (!supabase) {
    return getMockChildByQrToken(qrToken)
  }

  const normalizedToken = qrToken.replace('kidbank://child/', '').trim()
  const client = requireSupabaseClient()
  const { data, error } = await client.rpc('find_child_by_qr_token', {
    p_qr_token: normalizedToken,
  })

  if (error) {
    throwFrenchError(error, 'Impossible de lire ce QR code.')
  }

  const row = (data[0] ?? null) as QrChildRow | null

  if (!row) {
    return null
  }

  return {
    id: row.child_account_id,
    profileId: row.profile_id,
    familyId: '',
    firstName: row.first_name ?? row.full_name.split(' ')[0] ?? 'Enfant',
    fullName: row.full_name,
    avatarInitials: initialsFromName(row.first_name ?? row.full_name),
    avatarColor: '#6D5DFB',
    balance: Number(row.balance),
    weeklyDelta: 0,
    qrToken: normalizedToken,
    isActive: true,
    canEditAvatar: true,
    mainGoalId: '',
  }
}

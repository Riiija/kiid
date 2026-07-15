import type { Reward, RewardClaim, RewardClaimStatus } from '../../../types/reward'
import { supabase } from '../../../lib/supabase'
import { isUuid } from '../../../utils/uuid'
import {
  listMockRewardClaims,
  listMockRewards,
  requestMockReward,
  reviewMockRewardClaim,
  saveMockReward,
} from '../../../mocks/mockRuntimeStore'
import { throwFrenchError } from '../../../utils/errors'

type RewardRow = {
  id: string
  family_id: string
  name: string
  description: string | null
  cost: number
  icon: string | null
  is_active: boolean
  created_by: string
}

type RewardClaimRow = {
  id: string
  reward_id: string
  child_account_id: string
  status: RewardClaimStatus
  requested_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  comment: string | null
}

function mapRewardRow(row: RewardRow): Reward {
  return {
    id: row.id,
    familyId: row.family_id,
    name: row.name,
    description: row.description ?? '',
    cost: Number(row.cost),
    icon: row.icon ?? 'emoji_events',
    isActive: row.is_active,
    createdBy: row.created_by,
    pendingClaims: 0,
  }
}

function mapRewardClaimRow(row: RewardClaimRow): RewardClaim {
  return {
    id: row.id,
    rewardId: row.reward_id,
    childId: row.child_account_id,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
    comment: row.comment ?? undefined,
  }
}

async function getCurrentProfileForWrite() {
  if (!supabase) {
    throw new Error("Supabase n'est pas configure.")
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    throwFrenchError(userError, "Impossible d'identifier l'utilisateur.")
  }

  if (!userData.user) {
    throw new Error('Utilisateur non authentifie.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, family_id')
    .eq('id', userData.user.id)
    .single()

  if (profileError) {
    throwFrenchError(profileError, 'Impossible de charger votre profil KidBank.')
  }

  if (!profile.family_id) {
    throw new Error('Profil sans famille.')
  }

  return {
    profileId: profile.id,
    familyId: profile.family_id,
  }
}

export async function listRewards(): Promise<Reward[]> {
  if (!supabase) {
    return listMockRewards()
  }

  const { data, error } = await supabase
    .from('rewards')
    .select('id, family_id, name, description, cost, icon, is_active, created_by')
    .order('created_at', { ascending: false })
    .returns<RewardRow[]>()

  if (error) {
    throwFrenchError(error, 'Impossible de charger les recompenses.')
  }

  return data.map((reward) => ({
    ...mapRewardRow(reward),
    pendingClaims: 0,
  }))
}

export async function listRewardClaims(childAccountId?: string): Promise<RewardClaim[]> {
  if (!supabase) {
    return listMockRewardClaims(childAccountId)
  }

  let query = supabase
    .from('reward_claims')
    .select('id, reward_id, child_account_id, status, requested_at, reviewed_at, reviewed_by, comment')
    .order('requested_at', { ascending: false })

  if (childAccountId) {
    query = query.eq('child_account_id', childAccountId)
  }

  const { data, error } = await query.returns<RewardClaimRow[]>()

  if (error) {
    throwFrenchError(error, 'Impossible de charger les demandes de recompense.')
  }

  return data.map(mapRewardClaimRow)
}

export async function requestReward(input: { rewardId: string; childAccountId: string }): Promise<RewardClaim> {
  if (!supabase) {
    return requestMockReward(input)
  }

  const { data, error } = await supabase
    .from('reward_claims')
    .insert({
      reward_id: input.rewardId,
      child_account_id: input.childAccountId,
      status: 'pending',
    })
    .select('id, reward_id, child_account_id, status, requested_at, reviewed_at, reviewed_by, comment')
    .single()
    .returns<RewardClaimRow>()

  if (error) {
    throwFrenchError(error, 'Impossible de demander cette recompense.')
  }

  return mapRewardClaimRow(data)
}

export async function reviewRewardClaim(input: {
  claimId: string
  status: Exclude<RewardClaimStatus, 'pending'>
  comment?: string
}): Promise<RewardClaim> {
  if (!supabase) {
    return reviewMockRewardClaim(input)
  }

  const { data, error } = await supabase
    .from('reward_claims')
    .update({
      status: input.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: (await getCurrentProfileForWrite()).profileId,
      comment: input.comment ?? null,
    })
    .eq('id', input.claimId)
    .select('id, reward_id, child_account_id, status, requested_at, reviewed_at, reviewed_by, comment')
    .single()
    .returns<RewardClaimRow>()

  if (error) {
    throwFrenchError(error, 'Impossible de valider cette demande.')
  }

  return mapRewardClaimRow(data)
}

export async function saveReward(reward: Reward): Promise<Reward> {
  if (!supabase) {
    return saveMockReward(reward)
  }

  const profile = await getCurrentProfileForWrite()
  const payload = {
    ...(isUuid(reward.id) ? { id: reward.id } : {}),
    family_id: profile.familyId,
    name: reward.name,
    description: reward.description,
    cost: reward.cost,
    icon: reward.icon,
    is_active: reward.isActive,
    created_by: profile.profileId,
  }

  const { data, error } = await supabase
    .from('rewards')
    .upsert(payload)
    .select('id, family_id, name, description, cost, icon, is_active, created_by')
    .single()
    .returns<RewardRow>()

  if (error) {
    throwFrenchError(error, 'Impossible denregistrer cette recompense.')
  }

  return mapRewardRow(data)
}

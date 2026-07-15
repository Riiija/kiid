import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/supabase', () => ({
  supabase: null,
}))

import { resetMockRuntimeStore } from '../../../mocks/mockRuntimeStore'
import { listRewardClaims, requestReward, reviewRewardClaim } from './rewardsService'

describe('rewardsService mock runtime', () => {
  beforeEach(() => {
    resetMockRuntimeStore()
  })

  it('cree une demande de recompense enfant', async () => {
    const claim = await requestReward({
      rewardId: 'reward-dessert',
      childAccountId: 'lucas',
    })

    expect(claim.status).toBe('pending')
    expect((await listRewardClaims('lucas'))[0].id).toBe(claim.id)
  })

  it('valide une demande de recompense', async () => {
    const reviewed = await reviewRewardClaim({
      claimId: 'claim-1',
      status: 'approved',
      comment: 'Bravo',
    })

    expect(reviewed.status).toBe('approved')
    expect(reviewed.reviewedAt).toBeDefined()
    expect((await listRewardClaims('lucas')).find((claim) => claim.id === 'claim-1')?.status).toBe('approved')
  })
})

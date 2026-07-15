import { family } from './currentUser'
import type { Reward, RewardClaim } from '../types/reward'

export const rewards: Reward[] = [
  {
    id: 'reward-game',
    familyId: family.id,
    name: '30 minutes de jeu video',
    description: 'Un bonus de temps de jeu valide par les parents.',
    cost: 20,
    icon: 'sports_esports',
    isActive: true,
    createdBy: 'Sophie Martin',
    pendingClaims: 2,
  },
  {
    id: 'reward-dessert',
    familyId: family.id,
    name: 'Choisir le dessert',
    description: 'Choisir le dessert du prochain repas en famille.',
    cost: 15,
    icon: 'icecream',
    isActive: true,
    createdBy: 'Sophie Martin',
    pendingClaims: 1,
  },
  {
    id: 'reward-cinema',
    familyId: family.id,
    name: 'Sortie au cinema',
    description: 'Une sortie cinema avec un parent.',
    cost: 80,
    icon: 'theaters',
    isActive: true,
    createdBy: 'Sophie Martin',
    pendingClaims: 0,
  },
  {
    id: 'reward-gift',
    familyId: family.id,
    name: 'Petit cadeau',
    description: 'Un petit cadeau choisi dans la liste familiale.',
    cost: 120,
    icon: 'redeem',
    isActive: true,
    createdBy: 'Sophie Martin',
    pendingClaims: 0,
  },
  {
    id: 'reward-movie-night',
    familyId: family.id,
    name: 'Soiree film',
    description: 'Choisir le film du vendredi soir.',
    cost: 35,
    icon: 'movie',
    isActive: false,
    createdBy: 'Sophie Martin',
    pendingClaims: 0,
  },
]

export const rewardClaims: RewardClaim[] = [
  {
    id: 'claim-1',
    rewardId: 'reward-game',
    childId: 'lucas',
    status: 'pending',
    requestedAt: '2026-07-14T19:20:00.000Z',
  },
  {
    id: 'claim-2',
    rewardId: 'reward-dessert',
    childId: 'emma',
    status: 'approved',
    requestedAt: '2026-07-12T13:15:00.000Z',
    reviewedAt: '2026-07-12T14:00:00.000Z',
    reviewedBy: 'Sophie Martin',
  },
  {
    id: 'claim-3',
    rewardId: 'reward-game',
    childId: 'noah',
    status: 'rejected',
    requestedAt: '2026-07-11T17:40:00.000Z',
    reviewedAt: '2026-07-11T18:05:00.000Z',
    reviewedBy: 'Sophie Martin',
    comment: 'On revoit ca demain.',
  },
]

export function getClaimsByChildId(childId: string) {
  return rewardClaims.filter((claim) => claim.childId === childId)
}

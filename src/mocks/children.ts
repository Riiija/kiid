import { family } from './currentUser'
import type { ChildAccount } from '../types/child'

export const children: ChildAccount[] = [
  {
    id: 'lucas',
    profileId: 'profile-child-lucas',
    familyId: family.id,
    firstName: 'Lucas',
    fullName: 'Lucas Martin',
    avatarInitials: 'LU',
    avatarColor: '#6D5DFB',
    balance: 125,
    weeklyDelta: 20,
    qrToken: '6d2f2f34-aed4-4be1-97a7-5f4b2b8d3b90',
    isActive: true,
    canEditAvatar: true,
    mainGoalId: 'goal-bike',
  },
  {
    id: 'emma',
    profileId: 'profile-child-emma',
    familyId: family.id,
    firstName: 'Emma',
    fullName: 'Emma Martin',
    avatarInitials: 'EM',
    avatarColor: '#22C55E',
    balance: 80,
    weeklyDelta: 5,
    qrToken: 'af4a9797-9e7c-4e95-8a8b-f507d5f47ff4',
    isActive: true,
    canEditAvatar: true,
    mainGoalId: 'goal-game',
  },
  {
    id: 'noah',
    profileId: 'profile-child-noah',
    familyId: family.id,
    firstName: 'Noah',
    fullName: 'Noah Martin',
    avatarInitials: 'NO',
    avatarColor: '#F59E0B',
    balance: 45,
    weeklyDelta: -10,
    qrToken: '4c60fce7-a7ad-4d0d-881d-a34c7e21492d',
    isActive: true,
    canEditAvatar: false,
    mainGoalId: 'goal-headphones',
  },
]

export function getChildById(childId: string) {
  return children.find((child) => child.id === childId)
}

export function getChildByQrToken(qrToken: string) {
  const normalizedToken = qrToken.replace('kidbank://child/', '').trim()

  return children.find((child) => child.qrToken === normalizedToken)
}

import type { DemoUser, Family } from '../types/user'

export const family: Family = {
  id: 'family-martin',
  name: 'Famille Martin',
}

export const parentUser: DemoUser = {
  id: 'profile-parent-sophie',
  familyId: family.id,
  email: 'parent@kidbank.local',
  fullName: 'Sophie Martin',
  firstName: 'Sophie',
  role: 'parent',
  avatarInitials: 'SM',
  avatarColor: '#6D5DFB',
  isActive: true,
}

export const childUser: DemoUser = {
  id: 'profile-child-lucas',
  familyId: family.id,
  email: 'child@kidbank.local',
  fullName: 'Lucas Martin',
  firstName: 'Lucas',
  role: 'child',
  avatarInitials: 'LU',
  avatarColor: '#6D5DFB',
  isActive: true,
}

export const demoUsers: DemoUser[] = [parentUser, childUser]

export function getDemoUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  return demoUsers.find((user) => user.email === normalizedEmail)
}

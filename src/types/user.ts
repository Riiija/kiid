export type UserRole = 'parent' | 'child'

export type DemoUser = {
  id: string
  familyId: string
  email: string
  fullName: string
  firstName: string
  role: UserRole
  avatarInitials: string
  avatarColor: string
  isActive: boolean
}

export type Family = {
  id: string
  name: string
}

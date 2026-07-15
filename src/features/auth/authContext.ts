import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { UserRole } from '../../types/user'
import type { AuthProfile } from './authService'

export type AuthContextValue = {
  session: Session | null
  profile: AuthProfile | null
  isLoading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<AuthProfile>
  signOut: () => Promise<void>
  hasRole: (role: UserRole) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
